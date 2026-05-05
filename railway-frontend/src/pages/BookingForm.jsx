import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { bookingApi } from '@/api/client';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { UserPlus, X, Loader2, AlertCircle, Train, MapPin, Calendar } from 'lucide-react';
import { toast } from 'sonner';

const emptyPassenger = { name: '', age: '', gender: 'MALE', berthPreference: '' };

export default function BookingForm() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state;

  const [passengers, setPassengers] = useState([{ ...emptyPassenger }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!state) {
    return (
      <div className="text-center py-32 animate-fade-up">
        <Train className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
        <p className="text-lg text-foreground font-[var(--font-display)]">No train selected</p>
        <p className="text-muted-foreground text-sm mt-1">Please search for trains first</p>
        <Button className="mt-6 bg-primary text-primary-foreground" onClick={() => navigate('/')}>
          Search Trains
        </Button>
      </div>
    );
  }

  const addPassenger = () => {
    if (passengers.length < 6) setPassengers([...passengers, { ...emptyPassenger }]);
  };

  const removePassenger = (index) => {
    if (passengers.length > 1) setPassengers(passengers.filter((_, i) => i !== index));
  };

  const updatePassenger = (index, field, value) => {
    const updated = [...passengers];
    updated[index] = { ...updated[index], [field]: value };
    setPassengers(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await bookingApi.create({
        trainRunId: state.trainRunId,
        coachType: state.coachType,
        fromStationId: state.fromStationId,
        toStationId: state.toStationId,
        passengers: passengers.map((p) => ({ ...p, age: parseInt(p.age) })),
      });
      toast.success(`Booking created! PNR: ${data.pnr}`);
      navigate(`/payment/${data.id}`, { state: { booking: data } });
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-up">
      <h1 className="font-[var(--font-display)] text-3xl text-foreground">Book Tickets</h1>

      {/* Journey summary */}
      <Card className="bg-card border-border overflow-hidden">
        <div className="h-0.5 bg-gradient-to-r from-primary/40 via-transparent to-primary/40" />
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
              <Train className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="font-[var(--font-display)] text-lg text-foreground">{state.trainName}</h3>
              <span className="text-xs font-mono text-muted-foreground">{state.trainNumber}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 rounded-lg bg-secondary/50 border border-border">
              <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1"><MapPin className="h-3 w-3" /> From</p>
              <p className="font-semibold text-foreground text-sm">{state.fromStation?.name || 'Station'}</p>
              <p className="text-xs text-primary font-mono mt-0.5">{state.departureTime}</p>
            </div>
            <div className="p-3 rounded-lg bg-secondary/50 border border-border">
              <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1"><MapPin className="h-3 w-3" /> To</p>
              <p className="font-semibold text-foreground text-sm">{state.toStation?.name || 'Station'}</p>
              <p className="text-xs text-primary font-mono mt-0.5">{state.arrivalTime}</p>
            </div>
            <div className="p-3 rounded-lg bg-secondary/50 border border-border">
              <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1"><Calendar className="h-3 w-3" /> Date</p>
              <p className="font-semibold text-foreground text-sm">{state.date}</p>
            </div>
            <div className="p-3 rounded-lg bg-secondary/50 border border-border">
              <p className="text-xs text-muted-foreground mb-1">Class</p>
              <Badge className="bg-primary/10 border border-primary/20 text-primary text-xs">{state.coachType?.replace('_', ' ')}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Passenger form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <Alert variant="destructive" className="bg-destructive/10 border-destructive/20">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex items-center justify-between">
          <h2 className="font-[var(--font-display)] text-xl text-foreground">
            Passengers <span className="text-muted-foreground text-base">({passengers.length}/6)</span>
          </h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addPassenger}
            disabled={passengers.length >= 6}
            className="border-primary/30 text-primary hover:bg-primary/5 hover:border-primary/50"
          >
            <UserPlus className="h-4 w-4 mr-1.5" /> Add
          </Button>
        </div>

        {passengers.map((p, i) => (
          <Card key={i} className="bg-card border-border overflow-hidden animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
                  Passenger {i + 1}
                </span>
                {passengers.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    onClick={() => removePassenger(i)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block">Name</Label>
                  <Input
                    placeholder="Full name"
                    className="h-10 bg-secondary/50 border-border/50 focus:border-primary/50 transition-all duration-200"
                    value={p.name}
                    onChange={(e) => updatePassenger(i, 'name', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block">Age</Label>
                  <Input
                    type="number"
                    min="1"
                    max="120"
                    placeholder="Age"
                    className="h-10 bg-secondary/50 border-border/50 focus:border-primary/50 transition-all duration-200"
                    value={p.age}
                    onChange={(e) => updatePassenger(i, 'age', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block">Gender</Label>
                  <Select value={p.gender} onValueChange={(v) => updatePassenger(i, 'gender', v)}>
                    <SelectTrigger className="h-10 bg-secondary/50 border-border/50"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MALE">Male</SelectItem>
                      <SelectItem value="FEMALE">Female</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block">Berth</Label>
                  <Select value={p.berthPreference || 'NONE'} onValueChange={(v) => updatePassenger(i, 'berthPreference', v === 'NONE' ? '' : v)}>
                    <SelectTrigger className="h-10 bg-secondary/50 border-border/50"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NONE">No preference</SelectItem>
                      <SelectItem value="LOWER">Lower</SelectItem>
                      <SelectItem value="MIDDLE">Middle</SelectItem>
                      <SelectItem value="UPPER">Upper</SelectItem>
                      <SelectItem value="SIDE_LOWER">Side Lower</SelectItem>
                      <SelectItem value="SIDE_UPPER">Side Upper</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        <div className="track-line opacity-20" />

        <Button
          type="submit"
          className="w-full h-14 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-base tracking-wide shadow-lg shadow-primary/20 transition-all duration-200"
          size="lg"
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Booking...
            </span>
          ) : (
            'Confirm Booking'
          )}
        </Button>
      </form>
    </div>
  );
}
