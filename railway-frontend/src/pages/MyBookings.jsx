import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookingApi } from '@/api/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Train, XCircle, CreditCard } from 'lucide-react';
import { toast } from 'sonner';

const statusStyles = {
  CONFIRMED: 'bg-emerald-50 border-emerald-200 text-emerald-700',
  PAYMENT_PENDING: 'bg-amber-50 border-amber-200 text-amber-700',
  RAC: 'bg-sky-50 border-sky-200 text-sky-700',
  WAITLISTED: 'bg-orange-50 border-orange-200 text-orange-700',
  CANCELLED: 'bg-red-50 border-red-200 text-red-700',
  FAILED: 'bg-slate-50 border-slate-200 text-slate-700',
};

export default function MyBookings() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [cancelPnr, setCancelPnr] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  const fetchBookings = async (p = 0) => {
    setLoading(true);
    try {
      const { data } = await bookingApi.getMy(p);
      setBookings(data.content || []);
      setTotalPages(data.totalPages || 0);
      setPage(p);
    } catch {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, []);

  const handleCancel = async () => {
    if (!cancelPnr) return;
    setCancelling(true);
    try {
      const { data } = await bookingApi.cancel(cancelPnr, cancelReason);
      toast.success(`Booking cancelled. Refund: ₹${data.refundAmount}`);
      setCancelPnr(null);
      setCancelReason('');
      fetchBookings(page);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cancellation failed');
    } finally {
      setCancelling(false);
    }
  };

  if (loading && bookings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 animate-fade-in">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
          <Loader2 className="relative h-10 w-10 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-up">
      <h1 className="font-[var(--font-display)] text-3xl text-foreground">My Bookings</h1>

      {bookings.length === 0 ? (
        <Card className="text-center p-16 bg-card border-border">
          <Train className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="font-[var(--font-display)] text-xl text-foreground">No bookings yet</p>
          <p className="text-muted-foreground text-sm mt-1">Start your journey today</p>
          <Button className="mt-6 bg-primary text-primary-foreground" onClick={() => navigate('/')}>
            Book a Train
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {bookings.map((b, idx) => (
            <Card
              key={b.id}
              className="bg-card border-border hover:border-primary/30 transition-all duration-300 overflow-hidden brass-shimmer"
              style={{ animationDelay: `${idx * 60}ms` }}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-0.5">PNR</p>
                    <p className="font-mono text-foreground font-bold tracking-wide">{b.pnr}</p>
                  </div>
                  <Badge className={`${statusStyles[b.bookingStatus] || ''} border px-3 py-1 text-xs`}>
                    {b.bookingStatus}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                  {[
                    { label: 'From', value: b.fromStationName || '-' },
                    { label: 'To', value: b.toStationName || '-' },
                    { label: 'Coach', value: b.coachType?.replace('_', ' ') },
                    { label: 'Fare', value: `₹${b.totalFare}` },
                  ].map(({ label, value }) => (
                    <div key={label} className="p-3 rounded-lg bg-secondary/50 border border-border">
                      <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
                      <p className="font-semibold text-foreground text-sm">{value}</p>
                    </div>
                  ))}
                </div>

                {b.passengers?.length > 0 && (
                  <div className="space-y-1.5 mb-4">
                    {b.passengers.map((p, i) => (
                      <div key={i} className="flex items-center gap-3 bg-secondary/50 border border-border px-3 py-2 rounded-lg text-xs">
                        <span className="font-medium text-foreground">{p.name}</span>
                        <span className="text-muted-foreground">Age {p.age}</span>
                        <Badge variant="outline" className={`${statusStyles[p.status] || ''} text-xs border`}>
                          {p.status}
                        </Badge>
                        {p.seatNumber && <span className="text-muted-foreground font-mono">Seat {p.seatNumber}</span>}
                        {p.coachNumber && <span className="text-muted-foreground font-mono">Coach {p.coachNumber}</span>}
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-2 pt-2 border-t border-border">
                  {b.bookingStatus === 'PAYMENT_PENDING' && (
                    <Button
                      size="sm"
                      className="bg-primary/10 border border-primary/20 text-primary hover:bg-primary hover:text-primary-foreground transition-all"
                      onClick={() => navigate(`/payment/${b.id}`, { state: { booking: b } })}
                    >
                      <CreditCard className="h-3.5 w-3.5 mr-1.5" /> Pay Now
                    </Button>
                  )}
                  {['CONFIRMED', 'RAC', 'WAITLISTED', 'PAYMENT_PENDING'].includes(b.bookingStatus) && (
                    <Dialog open={cancelPnr === b.pnr} onOpenChange={(open) => { if (!open) setCancelPnr(null); }}>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive/80 hover:text-destructive hover:bg-destructive/10"
                          onClick={() => setCancelPnr(b.pnr)}
                        >
                          <XCircle className="h-3.5 w-3.5 mr-1.5" /> Cancel
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-card border-border">
                        <DialogHeader>
                          <DialogTitle className="font-[var(--font-display)] text-xl">Cancel Booking</DialogTitle>
                          <DialogDescription className="text-muted-foreground">
                            Cancel booking <span className="font-mono text-foreground">{b.pnr}</span>? A refund will be initiated.
                          </DialogDescription>
                        </DialogHeader>
                        <div>
                          <Label className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Reason (optional)</Label>
                          <Input
                            className="mt-2 bg-secondary/50 border-border focus:border-primary/50"
                            value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                            placeholder="Reason for cancellation"
                          />
                        </div>
                        <DialogFooter className="gap-2">
                          <Button variant="outline" className="border-border" onClick={() => setCancelPnr(null)}>
                            Keep Booking
                          </Button>
                          <Button
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={handleCancel}
                            disabled={cancelling}
                          >
                            {cancelling ? 'Cancelling...' : 'Confirm Cancel'}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 pt-4">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 0}
                onClick={() => fetchBookings(page - 1)}
                className="border-border hover:border-primary/50"
              >
                Previous
              </Button>
              <span className="text-xs text-muted-foreground font-mono">
                {page + 1} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages - 1}
                onClick={() => fetchBookings(page + 1)}
                className="border-border hover:border-primary/50"
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
