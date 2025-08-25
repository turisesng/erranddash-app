import { Store, categoryLabels, categoryIcons, useStoreContacts } from '@/hooks/useStores';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { icons } from 'lucide-react';

interface StoreCardProps {
  store: Store;
}

export const StoreCard: React.FC<StoreCardProps> = ({ store }) => {
  const { data: storeContacts } = useStoreContacts(store.id);
  const navigate = useNavigate();
  const CategoryIcon = icons[categoryIcons[store.category] as keyof typeof icons];

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {CategoryIcon && <CategoryIcon className="h-5 w-5 text-primary" />}
            <div>
              <CardTitle className="text-lg">{store.name}</CardTitle>
              <Badge variant="secondary" className="mt-1">
                {categoryLabels[store.category]}
              </Badge>
            </div>
          </div>
        </div>
        {store.description && (
          <CardDescription className="line-clamp-2">
            {store.description}
          </CardDescription>
        )}
      </CardHeader>
      
      <CardContent>
        <div className="space-y-2 mb-4">
          {store.address && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{store.address}</span>
            </div>
          )}
          
          {storeContacts?.phone && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="h-4 w-4" />
              <span>{storeContacts.phone}</span>
            </div>
          )}

          {storeContacts?.email && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-4 w-4" />
              <span>{storeContacts.email}</span>
            </div>
          )}
          
          {store.hours && Object.keys(store.hours).length > 0 && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>See hours</span>
            </div>
          )}
        </div>
        
        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => navigate(`/stores/${store.id}`)}
        >
          View Details
        </Button>
      </CardContent>
    </Card>
  );
};