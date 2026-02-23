import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  ShoppingCart,
  Package,
  ArrowLeft,
  Plus,
  Minus,
  Loader2,
  ShoppingBag,
  Shirt,
  BookOpen,
} from "lucide-react";

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
}

export default function Shop() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, { size?: string; color?: string }>>({});
  
  const { data: products, isLoading } = trpc.payments.getMerchandiseProducts.useQuery();
  const checkoutMutation = trpc.payments.createMerchandiseCheckout.useMutation({
    onSuccess: (data) => {
      if (data.checkoutUrl) {
        toast.success("Redirecting to checkout...");
        window.open(data.checkoutUrl, "_blank");
      }
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create checkout session");
    },
  });

  const addToCart = (product: any) => {
    const options = selectedOptions[product.id] || {};
    
    // Check if product with same options exists in cart
    const existingIndex = cart.findIndex(
      (item) =>
        item.productId === product.id &&
        item.size === options.size &&
        item.color === options.color
    );

    if (existingIndex >= 0) {
      const newCart = [...cart];
      newCart[existingIndex].quantity += 1;
      setCart(newCart);
    } else {
      setCart([
        ...cart,
        {
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
          size: options.size,
          color: options.color,
        },
      ]);
    }
    toast.success(`${product.name} added to cart`);
  };

  const updateQuantity = (index: number, delta: number) => {
    const newCart = [...cart];
    newCart[index].quantity += delta;
    if (newCart[index].quantity <= 0) {
      newCart.splice(index, 1);
    }
    setCart(newCart);
  };

  const removeFromCart = (index: number) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    
    checkoutMutation.mutate({
      items: cart.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
      })),
    });
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "apparel":
        return <Shirt className="w-5 h-5" />;
      case "accessories":
        return <Package className="w-5 h-5" />;
      case "digital":
        return <BookOpen className="w-5 h-5" />;
      default:
        return <ShoppingBag className="w-5 h-5" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-6 h-6 text-green-600" />
                <span className="text-xl font-bold text-stone-900">
                  L.A.W.S. Shop
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <ShoppingCart className="w-6 h-6 text-stone-600" />
                {cart.length > 0 && (
                  <Badge className="absolute -top-2 -right-2 bg-green-600 text-white text-xs px-1.5">
                    {cart.reduce((sum, item) => sum + item.quantity, 0)}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Products Grid */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-stone-900 mb-6">
              Branded Merchandise
            </h2>
            
            {/* Coming Soon Banner */}
            <Card className="mb-8 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-green-100 rounded-full">
                    <Shirt className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-green-800 mb-2">
                      Official Merchandise Coming Soon!
                    </h3>
                    <p className="text-green-700 text-sm mb-4">
                      Our Design Department is currently developing exclusive L.A.W.S. Collective branded items. 
                      Each piece will be thoughtfully designed to represent our mission of building multi-generational wealth through purpose and community.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="bg-white text-green-700 border-green-300">
                        Hoodies & Apparel
                      </Badge>
                      <Badge variant="outline" className="bg-white text-green-700 border-green-300">
                        Accessories
                      </Badge>
                      <Badge variant="outline" className="bg-white text-green-700 border-green-300">
                        Educational Materials
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
            
            <p className="text-stone-600 mb-8">
              Support the L.A.W.S. Collective and represent the movement with our branded merchandise. 
              Every purchase supports community programs and wealth-building initiatives.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {products?.map((product) => (
                <Card key={product.id} className="overflow-hidden">
                  <div className="aspect-square bg-stone-100 flex items-center justify-center">
                    <div className="text-center p-4">
                      {getCategoryIcon(product.category)}
                      <p className="mt-2 text-sm text-stone-500">Product Image</p>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-stone-900">{product.name}</h3>
                      <Badge variant="outline" className="capitalize">
                        {product.category}
                      </Badge>
                    </div>
                    <p className="text-sm text-stone-600 mb-3">{product.description}</p>
                    <p className="text-lg font-bold text-green-600 mb-4">
                      {product.priceFormatted}
                    </p>

                    {/* Size selector */}
                    {"sizes" in product && product.sizes && (
                      <div className="mb-3">
                        <label className="text-sm font-medium text-stone-700">Size</label>
                        <Select
                          value={selectedOptions[product.id]?.size || ""}
                          onValueChange={(value) =>
                            setSelectedOptions({
                              ...selectedOptions,
                              [product.id]: { ...selectedOptions[product.id], size: value },
                            })
                          }
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select size" />
                          </SelectTrigger>
                          <SelectContent>
                            {(product.sizes as string[]).map((size) => (
                              <SelectItem key={size} value={size}>
                                {size}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {/* Color selector */}
                    {"colors" in product && product.colors && (
                      <div className="mb-4">
                        <label className="text-sm font-medium text-stone-700">Color</label>
                        <Select
                          value={selectedOptions[product.id]?.color || ""}
                          onValueChange={(value) =>
                            setSelectedOptions({
                              ...selectedOptions,
                              [product.id]: { ...selectedOptions[product.id], color: value },
                            })
                          }
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select color" />
                          </SelectTrigger>
                          <SelectContent>
                            {(product.colors as string[]).map((color) => (
                              <SelectItem key={color} value={color}>
                                {color}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <Button
                      className="w-full bg-green-600 hover:bg-green-700 gap-2"
                      onClick={() => addToCart(product)}
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Add to Cart
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Cart Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24">
              <h3 className="text-lg font-bold text-stone-900 mb-4 flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Your Cart
              </h3>

              {cart.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingBag className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                  <p className="text-stone-500">Your cart is empty</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4 mb-6">
                    {cart.map((item, index) => (
                      <div key={index} className="flex items-start gap-3 pb-4 border-b border-stone-100">
                        <div className="flex-1">
                          <p className="font-medium text-stone-900 text-sm">{item.name}</p>
                          {item.size && (
                            <p className="text-xs text-stone-500">Size: {item.size}</p>
                          )}
                          {item.color && (
                            <p className="text-xs text-stone-500">Color: {item.color}</p>
                          )}
                          <p className="text-sm text-green-600 font-medium">
                            ${((item.price * item.quantity) / 100).toFixed(2)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => updateQuantity(index, -1)}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="text-sm font-medium w-6 text-center">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => updateQuantity(index, 1)}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-stone-200 pt-4 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-stone-900">Total</span>
                      <span className="text-xl font-bold text-green-600">
                        ${(cartTotal / 100).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <Button
                    className="w-full bg-green-600 hover:bg-green-700 gap-2"
                    onClick={handleCheckout}
                    disabled={checkoutMutation.isPending}
                  >
                    {checkoutMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <ShoppingCart className="w-4 h-4" />
                    )}
                    Checkout
                  </Button>
                  <p className="text-xs text-stone-500 text-center mt-3">
                    Secure checkout powered by Stripe
                  </p>
                </>
              )}
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-stone-900 text-white py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-stone-400">
            &copy; {new Date().getFullYear()} L.A.W.S. Collective. All proceeds support community programs.
          </p>
        </div>
      </footer>
    </div>
  );
}
