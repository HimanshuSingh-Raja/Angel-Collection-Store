'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  CreditCard,
  Lock,
  ArrowRight,
  MapPin,
  Home,
  Briefcase,
  Tag,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  ShieldCheck,
  Loader2,
  UserCheck,
  LogIn,
  UserPlus,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { formatPrice } from '@/lib/utils';
import { AddressFormModal } from '@/components/checkout/AddressFormModal';
import {
  getUserAddressesAction,
  createUserAddressAction,
  updateUserAddressAction,
  deleteUserAddressAction,
  setDefaultAddressAction,
} from '@/actions/address-actions';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, subtotal, discount, shippingFee, tax, total, clearCart } = useCart();
  const { user, loading: authLoading } = useAuth();

  // Logged-in Saved Addresses
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [loadingAddresses, setLoadingAddresses] = useState(true);

  // Payment Method State
  const [paymentMethod, setPaymentMethod] = useState<'RAZORPAY' | 'COD'>('RAZORPAY');
  const [isProcessing, setIsProcessing] = useState(false);

  // Address Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any>(null);

  // Dynamically Load Razorpay Checkout Script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  // Redirect if unauthenticated guest user accesses checkout directly
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/checkout');
    }
  }, [authLoading, user, router]);

  // Load real saved addresses for logged-in user
  useEffect(() => {
    async function loadAddresses() {
      if (!user?.id) {
        setLoadingAddresses(false);
        return;
      }

      setLoadingAddresses(true);
      try {
        const liveAddresses = await getUserAddressesAction(user.id);
        setSavedAddresses(liveAddresses);
        if (liveAddresses.length > 0) {
          const defaultAddr = liveAddresses.find((a) => a.isDefault) || liveAddresses[0];
          setSelectedAddressId(defaultAddr.id);
        }
      } catch (err) {
        console.error('Failed to load user addresses:', err);
      } finally {
        setLoadingAddresses(false);
      }
    }
    loadAddresses();
  }, [user?.id]);

  const activeAddress = savedAddresses.find((a) => a.id === selectedAddressId);

  const handleSaveAddress = async (data: any) => {
    if (!user?.id) return;

    if (editingAddress) {
      const res = await updateUserAddressAction(editingAddress.id, user.id, data);
      if (res.success && res.address) {
        setSavedAddresses((prev) => prev.map((a) => (a.id === editingAddress.id ? res.address : a)));
      }
    } else {
      const res = await createUserAddressAction({ ...data, userId: user.id });
      if (res.success && res.address) {
        setSavedAddresses((prev) => [res.address, ...prev]);
        setSelectedAddressId(res.address.id);
      }
    }
    setEditingAddress(null);
  };

  const handleDeleteAddress = async (addressId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user?.id) return;
    if (confirm('Are you sure you want to delete this address?')) {
      setSavedAddresses((prev) => prev.filter((a) => a.id !== addressId));
      await deleteUserAddressAction(addressId, user.id);
    }
  };

  const handleSetDefault = async (addressId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user?.id) return;
    setSavedAddresses((prev) => prev.map((a) => ({ ...a, isDefault: a.id === addressId })));
    await setDefaultAddressAction(addressId, user.id);
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    if (!user?.id || !user?.email) {
      alert('Authentication required. Please sign in to place your order.');
      router.push('/login?redirect=/checkout');
      return;
    }

    if (!activeAddress) {
      alert('Please add and select a delivery address before placing your order.');
      setIsModalOpen(true);
      return;
    }

    const customerName = activeAddress.name;
    const customerEmail = user.email;
    const customerPhone = activeAddress.phone;
    const fullAddressString = `${activeAddress.name} | ${activeAddress.phone} | ${activeAddress.street}, ${
      activeAddress.apartment ? activeAddress.apartment + ', ' : ''
    }${activeAddress.city}, ${activeAddress.state} - ${activeAddress.postalCode}, ${activeAddress.country}`;

    setIsProcessing(true);

    const orderPayload = {
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress: fullAddressString,
      items: cart.map((i) => ({
        productId: i.product.id,
        title: i.product.title,
        price: i.product.price,
        quantity: i.quantity,
        size: i.size,
        color: i.color,
        image: i.product.images?.[0]?.url,
      })),
      subtotal,
      discount,
      shippingFee,
      tax,
      total,
    };

    // FLOW A: RAZORPAY ONLINE PAYMENT
    if (paymentMethod === 'RAZORPAY') {
      try {
        console.log('🚀 [RAZORPAY CHECKOUT] 1. Requesting Razorpay Order ID from server...');
        const createOrderRes = await fetch('/api/razorpay/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: total }),
        });

        const orderData = await createOrderRes.json();

        if (!createOrderRes.ok || !orderData.success) {
          alert(orderData.message || 'Failed to initialize Razorpay checkout.');
          setIsProcessing(false);
          return;
        }

        const options = {
          key: orderData.keyId,
          amount: orderData.amount,
          currency: orderData.currency || 'INR',
          name: 'Angel Collection',
          description: 'Haute Couture Order',
          image: '/favicon.ico',
          order_id: orderData.razorpayOrderId,
          prefill: {
            name: customerName,
            email: customerEmail,
            contact: customerPhone,
          },
          theme: {
            color: '#D4AF37',
          },
          handler: async function (response: any) {
            console.log('✅ [RAZORPAY CHECKOUT] 2. Payment completed. Verifying signature on server...');
            try {
              const verifyRes = await fetch('/api/razorpay/verify-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  ...orderPayload,
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature,
                }),
              });

              const verifyData = await verifyRes.json();
              if (verifyRes.ok && verifyData.success && verifyData.order) {
                clearCart();
                setIsProcessing(false);
                router.push(`/order-confirmation/${verifyData.order.orderNumber}`);
              } else {
                alert(verifyData.message || 'Payment signature verification failed.');
                setIsProcessing(false);
              }
            } catch (err) {
              console.error('❌ [RAZORPAY VERIFICATION ERROR]:', err);
              alert('Payment verification failed. Please contact support.');
              setIsProcessing(false);
            }
          },
          modal: {
            ondismiss: function () {
              console.log('⚠️ [RAZORPAY CHECKOUT] Payment modal dismissed by user.');
              setIsProcessing(false);
            },
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.on('payment.failed', function (resp: any) {
          console.error('❌ [RAZORPAY PAYMENT FAILED]:', resp.error);
          alert(`Payment Failed: ${resp.error.description || 'Transaction declined.'}`);
          setIsProcessing(false);
        });
        rzp.open();
      } catch (err) {
        console.error('❌ [RAZORPAY INITIALIZATION ERROR]:', err);
        alert('An error occurred while launching Razorpay. Please try again.');
        setIsProcessing(false);
      }
      return;
    }

    // FLOW B: CASH ON DELIVERY (COD)
    try {
      console.log('🚀 [COD CHECKOUT] Dispatching order to /api/orders...');
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...orderPayload,
          paymentMethod: 'COD',
        }),
      });

      const data = await response.json();
      if (response.ok && data.success && data.order) {
        clearCart();
        setIsProcessing(false);
        router.push(`/order-confirmation/${data.order.orderNumber}`);
      } else if (response.status === 401) {
        alert('Your authentication session has expired. Please sign in again.');
        router.push('/login?redirect=/checkout');
        setIsProcessing(false);
      } else {
        alert(data.message || 'Failed to place order.');
        setIsProcessing(false);
      }
    } catch (error) {
      console.error('❌ [CHECKOUT ERROR]:', error);
      alert('An error occurred while placing your order. Please try again.');
      setIsProcessing(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'WORK':
        return Briefcase;
      case 'OTHER':
        return Tag;
      default:
        return Home;
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-xs text-neutral-400 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-amber-700" />
        <span>Verifying security session...</span>
      </div>
    );
  }

  // Unauthenticated Banner Fallback
  if (!user) {
    return (
      <div className="max-w-md mx-auto my-24 p-8 bg-white border border-neutral-200 rounded-3xl text-center space-y-6 shadow-xl">
        <div className="w-16 h-16 bg-amber-50 text-amber-800 rounded-full flex items-center justify-center mx-auto border border-amber-200 shadow-sm">
          <Lock className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-800">
            AUTHENTICATION REQUIRED
          </span>
          <h2 className="font-serif text-2xl font-bold text-neutral-900">Sign In to Continue Checkout</h2>
          <p className="text-xs text-neutral-500 leading-relaxed">
            Please log in or create an account to proceed with your order and view delivery status.
          </p>
        </div>
        <div className="space-y-3 pt-2">
          <Link
            href="/login?redirect=/checkout"
            className="w-full py-3.5 bg-neutral-950 text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-amber-700 transition flex items-center justify-center gap-2 shadow-lg"
          >
            <LogIn className="w-4 h-4 text-amber-300" />
            <span>Sign In to Account</span>
          </Link>
          <Link
            href="/register?redirect=/checkout"
            className="w-full py-3.5 bg-neutral-100 text-neutral-900 font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-neutral-200 transition flex items-center justify-center gap-2 border border-neutral-200"
          >
            <UserPlus className="w-4 h-4 text-neutral-600" />
            <span>Create New Account</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 font-sans">
      {/* Header Banner */}
      <div className="border-b border-neutral-200 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-amber-700 font-bold block">
            AUTHENTICATED PRIVILEGE CHECKOUT
          </span>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-neutral-900 mt-1">
            Complete Your Order
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs text-neutral-600 font-medium bg-neutral-100 px-3.5 py-1.5 rounded-full border border-neutral-200">
            <UserCheck className="w-4 h-4 text-amber-700" />
            <span>Logged in as: <strong className="text-neutral-900">{user.email}</strong></span>
          </div>
          <div className="flex items-center gap-2 text-xs text-neutral-500 font-medium bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-emerald-800 font-bold">256-Bit SSL Encrypted</span>
          </div>
        </div>
      </div>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
        {/* Left Column: Delivery Address & Payment */}
        <div className="lg:col-span-2 space-y-8">
          {/* Step 1: Delivery Address */}
          <div className="bg-white p-8 rounded-3xl border border-neutral-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
              <div className="flex items-center space-x-3 text-neutral-900">
                <MapPin className="w-5 h-5 text-amber-700" />
                <h2 className="font-serif text-xl font-bold">1. Select Delivery Address</h2>
              </div>

              <button
                type="button"
                onClick={() => {
                  setEditingAddress(null);
                  setIsModalOpen(true);
                }}
                className="px-4 py-2 bg-neutral-950 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-amber-700 transition flex items-center gap-1.5 cursor-pointer shadow"
              >
                <Plus className="w-4 h-4 text-amber-300" />
                <span>Add New Address</span>
              </button>
            </div>

            {/* Saved Address Cards */}
            {loadingAddresses ? (
              <div className="py-12 text-center text-xs text-neutral-400 flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
                <span>Loading saved addresses...</span>
              </div>
            ) : savedAddresses.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {savedAddresses.map((addr) => {
                  const TypeIcon = getTypeIcon(addr.type);
                  const isSelected = selectedAddressId === addr.id;
                  return (
                    <div
                      key={addr.id}
                      onClick={() => setSelectedAddressId(addr.id)}
                      className={`p-5 rounded-2xl border cursor-pointer transition relative flex flex-col justify-between space-y-4 ${
                        isSelected
                          ? 'bg-amber-50/50 border-amber-600 text-neutral-950 shadow-md ring-2 ring-amber-500/20'
                          : 'bg-neutral-50 border-neutral-200 text-neutral-700 hover:border-neutral-300'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-900 text-white text-[10px] font-bold uppercase tracking-wider">
                            <TypeIcon className="w-3 h-3 text-amber-400" />
                            {addr.type || 'HOME'}
                          </span>

                          {addr.isDefault ? (
                            <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">
                              ★ DEFAULT
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={(e) => handleSetDefault(addr.id, e)}
                              className="text-[10px] text-neutral-400 hover:text-amber-700 font-semibold"
                            >
                              Make Default
                            </button>
                          )}
                        </div>

                        <div className="text-xs space-y-1 pt-1">
                          <p className="font-bold text-neutral-900 text-sm">{addr.name}</p>
                          <p className="text-neutral-700 leading-relaxed font-medium">{addr.street}</p>
                          {addr.apartment && <p className="text-neutral-500">{addr.apartment}</p>}
                          <p className="text-neutral-800 font-bold">
                            {addr.city}, {addr.state} - {addr.postalCode}
                          </p>
                          <p className="text-neutral-500 font-mono text-[11px]">Phone: {addr.phone}</p>
                        </div>
                      </div>

                      {/* Card Controls */}
                      <div className="pt-3 border-t border-neutral-200/60 flex items-center justify-between text-xs">
                        <span className="font-bold text-amber-800 text-[11px]">
                          {isSelected ? '✓ Deliver Here' : 'Click to select'}
                        </span>
                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingAddress(addr);
                              setIsModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg bg-neutral-200 hover:bg-neutral-300 text-neutral-800 transition"
                            title="Edit Address"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleDeleteAddress(addr.id, e)}
                            className="p-1.5 rounded-lg bg-neutral-200 hover:bg-rose-100 text-neutral-800 hover:text-rose-600 transition"
                            title="Delete Address"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 bg-neutral-50 border-2 border-dashed border-neutral-200 rounded-2xl text-center space-y-3">
                <MapPin className="w-8 h-8 text-neutral-400 mx-auto" />
                <p className="font-bold text-neutral-800 text-sm">No saved delivery addresses found.</p>
                <button
                  type="button"
                  onClick={() => {
                    setEditingAddress(null);
                    setIsModalOpen(true);
                  }}
                  className="px-6 py-3 bg-neutral-950 text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-amber-700 transition inline-flex items-center gap-2 cursor-pointer shadow-lg"
                >
                  <Plus className="w-4 h-4 text-amber-300" />
                  <span>Add Delivery Address</span>
                </button>
              </div>
            )}
          </div>

          {/* Step 2: Payment Method */}
          <div className="bg-white p-8 rounded-3xl border border-neutral-200 shadow-sm space-y-6">
            <div className="flex items-center space-x-3 text-neutral-900 border-b border-neutral-100 pb-4">
              <CreditCard className="w-5 h-5 text-amber-700" />
              <h2 className="font-serif text-xl font-bold">2. Payment Method</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label
                onClick={() => setPaymentMethod('RAZORPAY')}
                className={`p-6 rounded-3xl border cursor-pointer transition flex flex-col justify-between space-y-4 ${
                  paymentMethod === 'RAZORPAY'
                    ? 'bg-neutral-950 text-white border-neutral-950 shadow-xl'
                    : 'bg-neutral-50 text-neutral-900 border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs uppercase tracking-wider">Razorpay Online</span>
                  <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center border-amber-400">
                    {paymentMethod === 'RAZORPAY' && <div className="w-2 h-2 rounded-full bg-amber-400" />}
                  </div>
                </div>
                <p className="text-[11px] opacity-80 leading-relaxed">
                  Instant UPI, Credit/Debit Cards, Net Banking & Cred with Razorpay 256-bit SSL Gateway.
                </p>
                <span className="text-[10px] text-amber-300 font-semibold uppercase">✓ Instant Confirmation</span>
              </label>

              <label
                onClick={() => setPaymentMethod('COD')}
                className={`p-6 rounded-3xl border cursor-pointer transition flex flex-col justify-between space-y-4 ${
                  paymentMethod === 'COD'
                    ? 'bg-neutral-950 text-white border-neutral-950 shadow-xl'
                    : 'bg-neutral-50 text-neutral-900 border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs uppercase tracking-wider">Cash On Delivery (COD)</span>
                  <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center border-amber-400">
                    {paymentMethod === 'COD' && <div className="w-2 h-2 rounded-full bg-amber-400" />}
                  </div>
                </div>
                <p className="text-[11px] opacity-80 leading-relaxed">
                  Pay cash or UPI upon delivery at your doorstep. Verified delivery OTP required.
                </p>
                <span className="text-[10px] text-amber-300 font-semibold uppercase">✓ Pay At Doorstep</span>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Order Items & Submit */}
        <div className="bg-white p-8 rounded-3xl border border-neutral-200 shadow-sm space-y-6 sticky top-28">
          <h3 className="font-serif text-xl font-bold text-neutral-900">Your Order Review</h3>

          <div className="max-h-60 overflow-y-auto space-y-4 pr-1 divide-y divide-neutral-100">
            {cart.map((item) => (
              <div key={item.id} className="pt-3 flex gap-3 items-center">
                <img src={item.product.images[0]?.url} alt="" className="w-12 h-14 object-cover rounded-lg" />
                <div className="flex-1 text-xs">
                  <p className="font-bold text-neutral-900 line-clamp-1">{item.product.title}</p>
                  <p className="text-neutral-500">Qty: {item.quantity} | Size: {item.size}</p>
                  <p className="font-bold text-amber-800">{formatPrice(item.product.price * item.quantity)}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-2 text-xs text-neutral-600 border-t border-neutral-200 pt-4">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-neutral-900">{formatPrice(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-emerald-600 font-medium">
                <span>Discount</span>
                <span>-{formatPrice(discount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Shipping Fee</span>
              <span>{shippingFee === 0 ? <strong className="text-emerald-700">FREE</strong> : formatPrice(shippingFee)}</span>
            </div>
            <div className="flex justify-between">
              <span>GST Tax (18%)</span>
              <span>{formatPrice(tax)}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-neutral-950 pt-3 border-t border-neutral-200">
              <span>Total Amount</span>
              <span className="text-amber-800">{formatPrice(total)}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isProcessing || cart.length === 0}
            className="w-full py-4 bg-neutral-950 text-white rounded-2xl font-bold text-xs uppercase tracking-[0.15em] hover:bg-amber-700 transition flex items-center justify-center gap-2 shadow-xl disabled:opacity-50 cursor-pointer"
          >
            {isProcessing ? (
              <span>PROCESSING PAYMENT & DISPATCHING EMAIL...</span>
            ) : paymentMethod === 'RAZORPAY' ? (
              <>
                <span>PAY WITH RAZORPAY NOW ({formatPrice(total)})</span>
                <ArrowRight className="w-4 h-4 text-amber-300" />
              </>
            ) : (
              <>
                <span>PLACE COD ORDER ({formatPrice(total)})</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Address Form Modal */}
      <AddressFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveAddress}
        initialData={editingAddress}
      />
    </div>
  );
}
