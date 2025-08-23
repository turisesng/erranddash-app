import { useState } from 'react';
import { useStores, categoryLabels, categoryIcons, StoreCategory } from '@/hooks/useStores';
import { StoreCard } from './StoreCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import { icons } from 'lucide-react';

export const StoreDirectory: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<StoreCategory | 'all'>('all');
  const { data: stores, isLoading, error } = useStores(selectedCategory === 'all' ? undefined : selectedCategory);

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            Failed to load stores. Please try again later.
          </p>
        </CardContent>
      </Card>
    );
  }

  const categories: Array<{ key: StoreCategory | 'all', label: string, icon: keyof typeof icons }> = [
    { key: 'all', label: 'All Stores', icon: 'Store' },
    { key: 'grocery', label: categoryLabels.grocery, icon: categoryIcons.grocery as keyof typeof icons },
    { key: 'pharmacy', label: categoryLabels.pharmacy, icon: categoryIcons.pharmacy as keyof typeof icons },
    { key: 'eatery', label: categoryLabels.eatery, icon: categoryIcons.eatery as keyof typeof icons },
    { key: 'suya', label: categoryLabels.suya, icon: categoryIcons.suya as keyof typeof icons },
    { key: 'others', label: categoryLabels.others, icon: categoryIcons.others as keyof typeof icons },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground mb-2">Store Directory</h2>
        <p className="text-muted-foreground">
          Discover local stores and services in your residential area
        </p>
      </div>

      <Tabs value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as StoreCategory | 'all')}>
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
          {categories.map((category) => {
            const Icon = icons[category.icon];
            return (
              <TabsTrigger key={category.key} value={category.key} className="flex items-center gap-2 text-xs lg:text-sm">
                {Icon && <Icon className="h-4 w-4" />}
                <span className="hidden sm:inline">{category.label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {categories.map((category) => (
          <TabsContent key={category.key} value={category.key} className="mt-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : stores && stores.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {stores.map((store) => (
                  <StoreCard key={store.id} store={store} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="flex flex-col items-center gap-4">
                    {(() => {
                      const Icon = icons[category.icon];
                      return Icon ? <Icon className="h-12 w-12 text-muted-foreground" /> : null;
                    })()}
                    <div>
                      <h3 className="text-lg font-medium mb-2">No stores found</h3>
                      <p className="text-muted-foreground">
                        {category.key === 'all' 
                          ? 'No stores are currently available in the directory'
                          : `No ${category.label.toLowerCase()} stores are currently available`
                        }
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};