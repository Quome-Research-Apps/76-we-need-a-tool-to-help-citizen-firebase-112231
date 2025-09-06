import type { ReactElement } from 'react';
import { Trash2, Wrench, Lightbulb, Car, TreePine, HelpCircle, Hammer, Building, ShieldAlert } from 'lucide-react';

interface IconProps {
  className?: string;
}

export const getCategoryIcon = (category: string, props: IconProps = {}): ReactElement => {
  const lowerCaseCategory = category?.toLowerCase() ?? '';

  const iconMapping: { keywords: string[]; icon: React.ComponentType<IconProps> }[] = [
    { keywords: ['trash', 'waste', 'recycling', 'garbage'], icon: Trash2 },
    { keywords: ['street', 'road', 'pothole', 'pavement'], icon: Wrench },
    { keywords: ['light', 'lamp', 'streetlight'], icon: Lightbulb },
    { keywords: ['parking', 'traffic', 'vehicle'], icon: Car },
    { keywords: ['tree', 'park', 'plant'], icon: TreePine },
    { keywords: ['building', 'zoning', 'permit'], icon: Building },
    { keywords: ['construction', 'noise'], icon: Hammer },
    { keywords: ['safety', 'police', 'enforcement'], icon: ShieldAlert },
  ];

  for (const { keywords, icon: Icon } of iconMapping) {
    if (keywords.some(keyword => lowerCaseCategory.includes(keyword))) {
      return <Icon {...props} />;
    }
  }

  return <HelpCircle {...props} />;
};
