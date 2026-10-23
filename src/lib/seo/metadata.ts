import type { Metadata } from 'next';

interface GenerateMetadataProps {
  title: string;
  description?: string;
  image?: string;
  noIndex?: boolean;
}

export function constructMetadata({
  title,
  description = 'GymX - Hệ thống quản lý phòng tập & thể hình hiện đại',
  image = '/images/og-image.jpg',
  noIndex = false,
}: GenerateMetadataProps): Metadata {
  return {
    title: `${title} | GymX`,
    description,
    openGraph: {
      title: `${title} | GymX`,
      description,
      images: [{ url: image }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | GymX`,
      description,
      images: [image],
    },
    ...(noIndex && {
      robots: {
        index: false,
        follow: false,
      },
    }),
  };
}
