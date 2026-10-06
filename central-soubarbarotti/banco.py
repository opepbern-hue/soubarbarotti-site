"""
Banco local (SQLite, um arquivo em dados/central.db). Nada sai do seu computador.

negocios.status:
  pool          enriquecido e aprovado no filtro barato, esperando a vez de ser validado
  sem_instagram passou no filtro mas não tem @ (só entra se EXIGIR_INSTAGRAM = False)
  filtrado      cortado no filtro barato
  descartado    cortado na validação do Instagram ou na nota da IA (motivo guardado)
  lead          qualificado, está no seu funil
"""
import json
import os
import sqlite3
import threading
from datetime import datetime

import config

_trava = threading.RLock()
_con: sqlite3.Connection | None = None

ESQUEMA = """
CREATE TABLE IF NOT EXISTS negocios(
  id TEXT PRIMARY KEY,
  status TEXT NOT NULL,
  motivo TEXT DEFAULT '',
  nicho TEXT,
  prioridade REAL DEFAULT 0,
  dados TEXT NOT NULL,
  etapa TEXT DEFAULT '',
  dia TEXT DEFAULT '',
  crm TEXT DEFAULT '{}',
  criado TEXT,
  atualizado TEXT
);
CREATE INDEX IF NOT EXISTS ix_status ON negocios(status, prioridade);
CREATE TABLE IF NOT EXISTS chaves(chave TEXT PRIMARY KEY, negocio_id TEXT);
CREATE TABLE IF NOT EXISTS buscas(chave TEXT PRIMARY KEY, feita TEXT);
"""


def con() -> sqlite3.Connection:
    global _con
    with _trava:
        if _con is None:
            os.makedirs(os.path.dirname(config.BANCO), exist_ok=True)
            _con = sqlite3.connect(config.BANCO, check_same_thread=False)
            _con.row_factory = sqlite3.Row
            _con.executescript(ESQUEMA)
            _con.execute("PRAGMA journal_mode=WAL")
        return _con


def agora() -> str:
    return datetime.now().isoformat(timespec="seconds")


def _linha(r: sqlite3.Row) -> dict:
    d = dict(r)
    d["dados"] = json.loads(d["dados"] or "{}")
    d["crm"] = json.loads(d["crm"] or "{}")
    return d


# ---------------------------------------------------------------- buscas
def busca_feita(chave: str) -> bool:
    with _trava:
        return con().execute("SELECT 1 FROM buscas WHERE chave=?", (chave,)).fetchone() is not None


def marcar_busca(chave: str):
    with _trava:
        con().execute("INSERT OR IGNORE INTO buscas VALUES(?,?)", (chave, agora()))
        con().commit()


# ---------------------------------------------------------------- negócios
def existe(id_: str) -> bool:
    with _trava:
        return con().execute("SELECT 1 FROM negocios WHERE id=?", (id_,)).fetchone() is not None


def duplicado(chaves: list[str]) -> bool:
    """Mesmo site, mesmo @ ou mesmo telefone de um negócio que já está no banco."""
    with _trava:
        for c in chaves:
            if con().execute("SELECT 1 FROM chaves WHERE chave=?", (c,)).fetchone():
                return True
    return False


def inserir(n: dict, status: str, motivo: str = "", prioridade: float = 0, chaves: list[str] = ()):
    with _trava:
        c = con()
        c.execute(
            "INSERT OR IGNORE INTO negocios(id,status,motivo,nicho,prioridade,dados,criado,atualizado)"
            " VALUES(?,?,?,?,?,?,?,?)",
            (n["id"], status, motivo, n.get("nicho"), prioridade, json.dumps(n, ensure_ascii=False), agora(), agora()),
        )
        for ch in chaves:
            c.execute("INSERT OR IGNORE INTO chaves VALUES(?,?)", (ch, n["id"]))
        c.commit()


def atualizar(id_: str, **campos):
    """Atualiza colunas. 'dados' e 'crm' podem vir como dict."""
    if not campos:
        return
    for k in ("dados", "crm"):
        if k in campos and not isinstance(campos[k], str):
            campos[k] = json.dumps(campos[k], ensure_ascii=False)
    campos["atualizado"] = agora()
    sets = ", ".join(f"{k}=?" for k in campos)
    with _trava:
        con().execute(f"UPDATE negocios SET {sets} WHERE id=?", (*campos.values(), id_))
        con().commit()


def pegar(id_: str) -> dict | None:
    with _trava:
        r = con().execute("SELECT * FROM negocios WHERE id=?", (id_,)).fetchone()
    return _linha(r) if r else None


def proximo_da_fila(nicho: str | None) -> dict | None:
    q = "SELECT * FROM negocios WHERE status='pool'"
    args: tuple = ()
    if nicho:
        q += " AND nicho=?"
        args = (nicho,)
    q += " ORDER BY prioridade DESC LIMIT 1"
    with _trava:
        r = con().execute(q, args).fetchone()
    return _linha(r) if r else None


def tamanho_fila() -> int:
    with _trava:
        return con().execute("SELECT COUNT(*) FROM negocios WHERE status='pool'").fetchone()[0]


def leads() -> list[dict]:
    with _trava:
        rs = con().execute("SELECT * FROM negocios WHERE status='lead' ORDER BY dia DESC, prioridade DESC").fetchall()
    return [_linha(r) for r in rs]


def contagem_status() -> dict:
    with _trava:
        rs = con().execute("SELECT status, COUNT(*) n FROM negocios GROUP BY status").fetchall()
    return {r["status"]: r["n"] for r in rs}


def leads_do_dia(dia: str) -> int:
    with _trava:
        return con().execute("SELECT COUNT(*) FROM negocios WHERE status='lead' AND dia=?", (dia,)).fetchone()[0]


def dias_trabalhados() -> int:
    with _trava:
        return con().execute("SELECT COUNT(DISTINCT dia) FROM negocios WHERE status='lead'").fetchone()[0]
