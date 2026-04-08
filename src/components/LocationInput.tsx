import * as React from 'react';
import { Input } from './ui/input';
import { MapPin } from 'lucide-react';

interface LocationInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

declare global {
  interface Window {
    google: any;
  }
}

export function LocationInput({ value, onChange, placeholder }: LocationInputProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const autocompleteRef = React.useRef<any>(null);

  React.useEffect(() => {
    const initAutocomplete = () => {
      if (!window.google || !window.google.maps || !window.google.maps.places || !inputRef.current) {
        // Retry after a short delay if script not loaded yet
        setTimeout(initAutocomplete, 500);
        return;
      }

      autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
        types: ['address'],
      });

      autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current.getPlace();
        if (place.formatted_address) {
          onChange(place.formatted_address);
        } else if (place.name) {
          onChange(place.name);
        }
      });
    };

    initAutocomplete();

    return () => {
      if (window.google && window.google.maps && window.google.maps.event && autocompleteRef.current) {
        window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [onChange]);

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || "Buscar endereço..."}
        className="pr-10"
      />
      <div className="absolute right-3 top-1/2 -translate-y-1/2">
        <MapPin className="w-4 h-4 text-muted-foreground" />
      </div>
    </div>
  );
}
