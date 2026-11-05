import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { loadEnv } from './load-env';

loadEnv();

async function main() {
  const { prisma } = await import('../src/lib/db');
  const { env } = await import('../src/lib/env');

  const uploadDir = path.resolve(env.uploadTmpDir);
  await fsp.mkdir(uploadDir, { recursive: true });

  const existingProject = await prisma.project.findUnique({ where: { slug: 'soft-communication' } });
  if (existingProject) {
    console.log('[importar-soft] Projeto Soft Communication já existe.');
    return;
  }

  const videoFiles = [
    {
      title: 'Soft Communication · Direção & Processo',
      file: '/Users/barbarotti/Downloads/SOFT COMMUNICATION (interno)/VIDEO/Soft_CommentTravaillerAvecNous_16x9.mp4',
      isHero: true,
    },
    {
      title: 'Soft Motion Reel · FR 60fps',
      file: '/Users/barbarotti/Movies/Soft Communication - Motion/soft-motion-FR-9x16-60fps.mp4',
      isHero: false,
    },
    {
      title: 'Soft Motion Reel · PT 60fps',
      file: '/Users/barbarotti/Movies/Soft Communication - Motion/soft-motion-PT-9x16-60fps.mp4',
      isHero: false,
    },
    {
      title: 'Soft Showreel Preview · 16x9',
      file: '/Users/barbarotti/Downloads/SOFT COMMUNICATION (interno)/VIDEO/Soft_Showreel_preview_sem_locucao_16x9_30fps.mp4',
      isHero: false,
    },
    {
      title: 'Soft Flyover Polinésia · 60fps',
      file: '/Users/barbarotti/Downloads/SOFT COMMUNICATION (interno)/VIDEO/soft-flyover-1440x1152-60fps.mp4',
      isHero: false,
    },
  ];

  const createdMediaIds: { id: string; title: string; isHero: boolean }[] = [];

  for (const item of videoFiles) {
    // Verifica se já temos uma mídia pronta com esse nome
    const existingMedia = await prisma.media.findFirst({
      where: { originalName: path.basename(item.file), status: 'READY' },
    });
    if (existingMedia) {
      console.log(`[importar-soft] Mídia já existente e pronta: ${item.title}`);
      createdMediaIds.push({ id: existingMedia.id, title: item.title, isHero: item.isHero });
      continue;
    }

    if (!fs.existsSync(item.file)) {
      console.warn(`[importar-soft] Arquivo não encontrado: ${item.file}`);
      continue;
    }
    const stat = await fsp.stat(item.file);
    const ext = path.extname(item.file) || '.mp4';
    const originalName = path.basename(item.file);

    console.log(`[importar-soft] Criando registro de mídia: ${item.title}`);
    const media = await prisma.media.create({
      data: {
        kind: 'VIDEO',
        status: 'UPLOADING',
        originalName,
        mimeType: 'video/mp4',
        alt: item.title,
        previewStartSec: 1,
        previewLengthSec: 8,
        sizeBytes: stat.size,
        receivedBytes: stat.size,
      },
    });

    const tempPath = path.resolve(uploadDir, `${media.id}${ext}`);
    await fsp.copyFile(item.file, tempPath);
    await prisma.media.update({ where: { id: media.id }, data: { tempPath, status: 'PENDING' } });

    console.log(`[importar-soft] Aguardando processamento do worker para ${media.id}...`);
    let readyMedia = null;
    for (let attempt = 0; attempt < 60; attempt++) {
      await new Promise((r) => setTimeout(r, 1500));
      const m = await prisma.media.findUnique({ where: { id: media.id } });
      if (m?.status === 'READY') {
        readyMedia = m;
        break;
      }
      if (m?.status === 'ERROR') {
        throw new Error(`Worker falhou na mídia ${media.id}: ${m.error}`);
      }
    }

    if (!readyMedia) {
      throw new Error(`Timeout esperando worker processar ${media.id}`);
    }

    console.log(`[importar-soft] Mídia ${media.id} processada com sucesso!`);
    createdMediaIds.push({ id: media.id, title: item.title, isHero: item.isHero });
  }

  const heroMedia = createdMediaIds.find((m) => m.isHero) || createdMediaIds[0];
  if (!heroMedia) {
    throw new Error('Nenhuma mídia foi criada com sucesso.');
  }

  console.log('[importar-soft] Criando projeto Soft Communication...');
  const project = await prisma.project.create({
    data: {
      slug: 'soft-communication',
      title: 'Soft Communication',
      category: 'Branding & Motion Design',
      client: 'Soft Communication',
      deliverable: 'Showreels, Filmes de Marca & Motion 60fps',
      location: 'Polinésia Francesa & Remoto',
      shortDescription:
        'Direção audiovisual internacional, campanhas de marca e motion design de alta fidelidade a 60fps para a agência da Polinésia Francesa.',
      featured: true,
      published: true,
      order: 0,
      heroMediaId: heroMedia.id,
      fullVideoMediaId: heroMedia.id,
      briefTitle: 'Identidade audiovisual e showreels internacionais',
      briefText:
        'Construir o ecossistema visual da Soft Communication unindo estética minimalista tropical, motion design fluido a 60fps e filmes de marca de alta conversão.',
      directionTitle: 'Narrativa imersiva e motion design avançado',
      directionText:
        'Criação de showreels verticais e horizontais em múltiplos idiomas (FR/PT), combinando sound design autoral, color grade cinematográfico e inteligência artificial generativa.',
      productionTitle: 'Pipeline ágil e produção remota',
      productionText:
        'Do desenvolvimento do roteiro e concept boards à masterização de alta precisão técnica em 60 quadros por segundo.',
      finishingTitle: 'Entrega multiplataforma',
      finishingText:
        'Formatos otimizados para campanhas globais, presença de marca no Instagram, YouTube e canais corporativos.',
    },
  });

  // Reordenar os outros projetos para que Soft Communication fique no topo (order: 0)
  await prisma.project.updateMany({
    where: { id: { not: project.id } },
    data: { order: { increment: 1 } },
  });

  // Adicionar os demais vídeos como itens de galeria
  const galleryVideos = createdMediaIds.filter((m) => !m.id || m.id !== heroMedia.id);
  for (let i = 0; i < galleryVideos.length; i++) {
    await prisma.projectGalleryItem.create({
      data: {
        projectId: project.id,
        mediaId: galleryVideos[i].id,
        kind: 'FRAME',
        caption: galleryVideos[i].title,
        order: i,
      },
    });
  }

  // Também adicionar à lista de marcas parceiras
  const existingBrand = await prisma.brand.findFirst({ where: { name: 'Soft Communication' } });
  if (!existingBrand) {
    await prisma.brand.create({
      data: {
        name: 'Soft Communication',
        url: '',
        published: true,
        order: 0,
      },
    });
  }

  console.log('[importar-soft] Sucesso total! Projeto Soft Communication criado e publicado.');
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error('[importar-soft] Erro:', err);
  process.exit(1);
});
