import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Plus, Minus, Trash2, ShoppingCart } from 'lucide-react';
import { useOrders, CreateOrderData } from '@/hooks/useOrders';
import { useToast } from '@/components/ui/use-toast';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface OrderFormProps {
  storeId: string;
  storeName: string;
  onOrderPlaced?: () => void;
}

export default function OrderForm({ storeId, storeName, onOrderPlaced }: OrderFormProps) {
  const [items, setItems] = useState<OrderItem[]>([{ name: '', quantity: 1, price: 0 }]);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const { createOrder, isCreating } = useOrders();
  const { toast } = useToast();

  const addItem = () => {
    setItems([...items, { name: '', quantity: 1, price: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: keyof OrderItem, value: string | number) => {
    const updatedItems = items.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    );
    setItems(updatedItems);
  };

  const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validItems = items.filter(item => item.name.trim() && item.price > 0);
    
    if (validItems.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one valid item.",
        variant: "destructive",
      });
      return;
    }

    if (!deliveryAddress.trim() || !phoneNumber.trim()) {
      toast({
        title: "Error", 
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const orderData: CreateOrderData = {
      store_id: storeId,
      items: validItems,
      total_amount: totalAmount,
      delivery_address: deliveryAddress.trim(),
      phone_number: phoneNumber.trim(),
      notes: notes.trim() || undefined,
    };

    createOrder(orderData, {
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Order placed successfully!",
        });
        setItems([{ name: '', quantity: 1, price: 0 }]);
        setDeliveryAddress('');
        setPhoneNumber('');
        setNotes('');
        setIsOpen(false);
        onOrderPlaced?.();
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to place order. Please try again.",
          variant: "destructive",
        });
      },
    });
  };

  if (!isOpen) {
    return (
      <Button onClick={() => setIsOpen(true)} className="w-full">
        <ShoppingCart className="h-4 w-4 mr-2" />
        Place Order
      </Button>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Place Order from {storeName}
          <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
            ×
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Order Items */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Order Items</Label>
            {items.map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-2 items-end">
                <div className="col-span-5">
                  <Label htmlFor={`item-name-${index}`}>Item</Label>
                  <Input
                    id={`item-name-${index}`}
                    value={item.name}
                    onChange={(e) => updateItem(index, 'name', e.target.value)}
                    placeholder="Item name"
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor={`item-qty-${index}`}>Qty</Label>
                  <div className="flex items-center">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => updateItem(index, 'quantity', Math.max(1, item.quantity - 1))}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <Input
                      id={`item-qty-${index}`}
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-16 text-center"
                      min="1"
                      type="number"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => updateItem(index, 'quantity', item.quantity + 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div className="col-span-3">
                  <Label htmlFor={`item-price-${index}`}>Price (₦)</Label>
                  <Input
                    id={`item-price-${index}`}
                    value={item.price}
                    onChange={(e) => updateItem(index, 'price', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    type="number"
                  />
                </div>
                <div className="col-span-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeItem(index)}
                    disabled={items.length === 1}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
            
            <Button type="button" variant="outline" onClick={addItem} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>

          <Separator />

          {/* Delivery Information */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Delivery Information</Label>
            
            <div>
              <Label htmlFor="delivery-address">Delivery Address *</Label>
              <Textarea
                id="delivery-address"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder="Enter your full delivery address"
                required
              />
            </div>

            <div>
              <Label htmlFor="phone-number">Phone Number *</Label>
              <Input
                id="phone-number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Your phone number"
                required
              />
            </div>

            <div>
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any special instructions or notes"
              />
            </div>
          </div>

          <Separator />

          {/* Order Summary */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-semibold">Total Amount:</span>
              <span className="text-lg font-bold">₦{totalAmount.toFixed(2)}</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Payment Method: Cash on Delivery
            </p>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isCreating}
          >
            {isCreating ? 'Placing Order...' : 'Place Order'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}