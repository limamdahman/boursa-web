import { Car, Truck, Bike, Zap, CarFront, Bus } from 'lucide-react';

interface Props {
  name: string;
  size?: number;
  strokeWidth?: number;
}

export default function CategoryIcons({ name, size = 32, strokeWidth = 1.5 }: Props) {
  const props = {
    size,
    strokeWidth,
    className: 'transition-transform duration-200 group-hover:-translate-y-px',
  };

  switch (name) {
    case 'car':
      return <Car {...props} />;
    case 'suv':
      return <CarFront {...props} />;
    case 'pickup':
      return <Truck {...props} />;
    case 'van':
      return <Bus {...props} />;
    case 'moto':
      return <Bike {...props} />;
    case 'bolt':
      return <Zap {...props} />;
    default:
      return <Car {...props} />;
  }
}
