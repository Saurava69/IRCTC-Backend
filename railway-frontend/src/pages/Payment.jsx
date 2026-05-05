import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { paymentApi } from '@/api/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CreditCard, Loader2, CheckCircle2, XCircle, RefreshCw, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function Payment() {
  const { bookingId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const booking = location.state?.booking;

  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [loading, setLoading] = useState(false);
  const [payment, setPayment] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    paymentApi.getByBooking(bookingId)
      .then(({ data }) => setPayment(data))
      .catch(() => {});
  }, [bookingId]);

  const handlePay = async () => {
    setError('');
    setLoading(true);
    try {
      const { data } = await paymentApi.initiate({ bookingId: parseInt(bookingId), paymentMethod });
      setPayment(data);
      if (data.paymentStatus === 'SUCCESS') {
        toast.success('Payment successful!');
      } else {
        toast.error(`Payment ${data.paymentStatus.toLowerCase()}: ${data.failureReason || 'Unknown error'}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = async () => {
    if (!payment?.id) return;
    setError('');
    setLoading(true);
    try {
      const { data } = await paymentApi.retry(payment.id);
      setPayment(data);
      if (data.paymentStatus === 'SUCCESS') {
        toast.success('Payment successful!');
      } else {
        toast.error('Payment failed again. You can retry.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Retry failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 animate-fade-up">
      <h1 className="font-[var(--font-display)] text-3xl text-foreground">Payment</h1>

      {booking && (
        <Card className="bg-card border-border overflow-hidden">
          <div className="h-0.5 bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
          <CardContent className="p-6">
            <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium mb-4">Booking Summary</p>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'PNR', value: booking.pnr, mono: true },
                { label: 'Status', value: booking.bookingStatus, badge: true },
                { label: 'Passengers', value: booking.passengerCount },
                { label: 'Total Fare', value: `₹${booking.totalFare}`, highlight: true },
              ].map(({ label, value, mono, badge, highlight }) => (
                <div key={label} className="p-3 rounded-lg bg-secondary/50 border border-border">
                  <p className="text-xs text-muted-foreground mb-1">{label}</p>
                  {badge ? (
                    <Badge className="bg-primary/10 border border-primary/20 text-primary text-xs">{value}</Badge>
                  ) : (
                    <p className={`font-semibold ${highlight ? 'text-primary text-lg' : 'text-foreground text-sm'} ${mono ? 'font-mono' : ''}`}>
                      {value}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <Alert variant="destructive" className="bg-destructive/10 border-destructive/20">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {payment?.paymentStatus === 'SUCCESS' ? (
        <Card className="bg-emerald-50 border-emerald-200 overflow-hidden animate-fade-up">
          <CardContent className="p-8 text-center">
            <div className="relative inline-block mb-5">
              <div className="absolute inset-0 bg-emerald-100 rounded-full blur-xl" />
              <CheckCircle2 className="relative h-16 w-16 text-emerald-500" />
            </div>
            <h2 className="font-[var(--font-display)] text-2xl text-emerald-800">Payment Successful</h2>
            <p className="text-emerald-600 mt-2 text-sm font-mono">TXN: {payment.gatewayTransactionId}</p>
            <p className="text-emerald-600 text-sm">Amount: ₹{payment.amount}</p>
            <div className="flex gap-3 justify-center mt-8">
              <Button
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={() => navigate('/my-bookings')}
              >
                View Bookings
              </Button>
              <Button
                variant="outline"
                className="border-emerald-300 text-emerald-700 hover:bg-emerald-100"
                onClick={() => navigate('/pnr')}
              >
                Check PNR
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : payment?.paymentStatus === 'FAILED' ? (
        <Card className="bg-red-50 border-red-200 overflow-hidden animate-fade-up">
          <CardContent className="p-8 text-center">
            <div className="relative inline-block mb-5">
              <div className="absolute inset-0 bg-red-100 rounded-full blur-xl" />
              <XCircle className="relative h-16 w-16 text-red-500" />
            </div>
            <h2 className="font-[var(--font-display)] text-2xl text-red-800">Payment Failed</h2>
            <p className="text-red-600 mt-2 text-sm">{payment.failureReason || 'Transaction could not be completed'}</p>
            <Button
              className="mt-8 bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={handleRetry}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Retrying...' : 'Retry Payment'}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-card border-border shadow-lg overflow-hidden">
          <div className="h-0.5 bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
          <CardContent className="p-8 space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                <CreditCard className="h-4 w-4 text-primary" />
              </div>
              <h2 className="font-[var(--font-display)] text-xl text-foreground">Make Payment</h2>
            </div>

            <div>
              <Label className="text-xs uppercase tracking-widest text-muted-foreground font-medium mb-2 block">Payment Method</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger className="h-12 bg-secondary/50 border-border/50"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="UPI">UPI</SelectItem>
                  <SelectItem value="CREDIT_CARD">Credit Card</SelectItem>
                  <SelectItem value="DEBIT_CARD">Debit Card</SelectItem>
                  <SelectItem value="NET_BANKING">Net Banking</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {booking && (
              <div className="p-6 rounded-xl bg-secondary/50 border border-border text-center">
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Amount to pay</p>
                <p className="text-4xl font-bold text-primary font-mono">₹{booking.totalFare}</p>
              </div>
            )}

            <Button
              className="w-full h-14 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-base tracking-wide shadow-lg shadow-primary/20 transition-all duration-200"
              size="lg"
              onClick={handlePay}
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Processing...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Pay Now
                </span>
              )}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
