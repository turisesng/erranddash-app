import { useParams, useNavigate } from 'react-router-dom';
import { useStore, categoryLabels, categoryIcons, useStoreContacts } from '@/hooks/useStores';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, MapPin, Phone, Mail, Clock } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { icons } from 'lucide-react';
import StoreChat from '@/components/StoreChat';


export default function StoreProfile() {
  const { storeId } = useParams<{ storeId: string }>();
  const navigate = useNavigate();
  const { data: store, isLoading, error } = useStore(storeId!);
  const { data: storeContacts } = useStoreContacts(storeId!);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !store) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto">
          <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <Card>
            <CardContent className="p-8 text-center">
              <h2 className="text-xl font-semibold mb-2">Store not found</h2>
              <p className="text-muted-foreground">
                The store you're looking for doesn't exist or has been removed.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const CategoryIcon = icons[categoryIcons[store.category] as keyof typeof icons];
  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-4xl mx-auto p-4">
          <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <div className="flex items-start gap-4">
            {CategoryIcon && <CategoryIcon className="h-8 w-8 text-primary mt-1" />}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-foreground mb-2">{store.name}</h1>
              <Badge variant="secondary">
                {categoryLabels[store.category]}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Description */}
        {store.description && (
          <Card>
            <CardHeader>
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">{store.description}</p>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {store.address && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Address</p>
                    <p className="text-muted-foreground">{store.address}</p>
                  </div>
                </div>
              )}

              {storeContacts?.phone && (
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Phone</p>
                    <a 
                      href={`tel:${storeContacts.phone}`}
                      className="text-primary hover:underline"
                    >
                      {storeContacts.phone}
                    </a>
                  </div>
                </div>
              )}

              {storeContacts?.email && (
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Email</p>
                    <a 
                      href={`mailto:${storeContacts.email}`}
                      className="text-primary hover:underline"
                    >
                      {storeContacts.email}
                    </a>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Operating Hours */}
          {store.hours && Object.keys(store.hours).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Operating Hours
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {daysOfWeek.map((day) => {
                    const hours = store.hours?.[day];
                    if (!hours) return null;
                    
                    return (
                      <div key={day} className="flex justify-between items-center">
                        <span className="capitalize font-medium">{day}</span>
                        <span className="text-muted-foreground">{hours}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Get in touch with {store.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {storeContacts?.phone && (
                <Button asChild>
                  <a href={`tel:${storeContacts.phone}`}>
                    <Phone className="h-4 w-4 mr-2" />
                    Call Store
                  </a>
                </Button>
              )}
              
              {storeContacts?.email && (
                <Button variant="outline" asChild>
                  <a href={`mailto:${storeContacts.email}`}>
                    <Mail className="h-4 w-4 mr-2" />
                    Send Email
                  </a>
                </Button>
              )}
              
              {store.address && (
                <Button variant="outline" asChild>
                  <a 
                    href={`https://maps.google.com/?q=${encodeURIComponent(store.address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    Get Directions
                  </a>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Chat Component */}
      <StoreChat 
        storeId={store.id} 
        storeName={store.name} 
      />
    </div>
  );
}