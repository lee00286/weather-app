import { render, screen } from '@testing-library/react';

import { ClothingCard } from '@/components/running/ClothingCard';
import type { ClothingRecommendation } from '@/lib/running/clothing';

const rec: ClothingRecommendation = {
  tierLabel: 'Cool',
  options: [
    { torso: 'long-sleeve', legs: 'shorts' },
    { torso: 'tee', legs: 'long pants (tights, joggers, or track pants)' },
  ],
  accessories: ['light gloves (optional)'],
  modifiers: ['windproof layer'],
};

describe('ClothingCard', () => {
  it('renders every outfit option and the accessories/modifiers', () => {
    render(<ClothingCard recommendation={rec} />);
    expect(screen.getByText('What to wear')).toBeInTheDocument();
    expect(screen.getByText(/long-sleeve/)).toBeInTheDocument();
    expect(screen.getByText(/long pants \(tights, joggers, or track pants\)/)).toBeInTheDocument();
    expect(screen.getByText(/light gloves/)).toBeInTheDocument();
    expect(screen.getByText(/windproof layer/)).toBeInTheDocument();
  });
});
