import {
  AudioTypeIcon,
  FileTypeIcon,
  ImageTypeIcon,
  TextTypeIcon,
  VideoTypeIcon,
} from '../../../../icons/icons';
import { cn } from '../../../../lib/utils';
import type { ModelInputKind } from '../types';

const MODALITY_ORDER: ModelInputKind[] = [
  'text',
  'image',
  'file',
  'audio',
  'video',
];

const MODALITY_LABELS: Record<ModelInputKind, string> = {
  text: 'Text',
  image: 'Image',
  file: 'File',
  audio: 'Audio',
  video: 'Video',
};

function modalityIcon(kind: ModelInputKind) {
  switch (kind) {
    case 'text':
      return TextTypeIcon;
    case 'image':
      return ImageTypeIcon;
    case 'file':
      return FileTypeIcon;
    case 'audio':
      return AudioTypeIcon;
    case 'video':
      return VideoTypeIcon;
  }
}

function modalityIsActive(active: Set<string>, kind: ModelInputKind) {
  return [...active].some((value) => value.toLowerCase() === kind);
}

type ModalityIconsRowProps = {
  active: Set<string>;
};

export function ModalityIconsRow({ active }: ModalityIconsRowProps) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {MODALITY_ORDER.map((kind) => {
        const Icon = modalityIcon(kind);
        const isActive = modalityIsActive(active, kind);

        return (
          <span
            key={kind}
            className={cn(
              'inline-flex items-center justify-center rounded-sm transition-colors',
              isActive
                ? 'text-gray-900 dark:text-white'
                : 'text-gray-300 dark:text-gray-600'
            )}
            title={MODALITY_LABELS[kind]}
          >
            <Icon className="size-4" />
          </span>
        );
      })}
    </div>
  );
}
