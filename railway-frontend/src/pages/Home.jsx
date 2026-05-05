import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { stationApi } from '@/api/client';
import { Search, ArrowRightLeft, Train, MapPin, Calendar, Shield, Clock, Users } from 'lucide-react';

function StationAutocomplete({ label, value, onChange, placeholder, hint }) {
  const [query, setQuery] = useState(value || '');
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(!!value);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (selected) return;
    if (query.length < 2) { setSuggestions([]); setOpen(false); return; }
    const timer = setTimeout(async () => {
      try {
        const { data } = await stationApi.search(query, 0, 8);
        setSuggestions(data.content || []);
        setOpen(true);
      } catch { setSuggestions([]); }
    }, 300);
    return () => clearTimeout(timer);
  }, [query, selected]);

  return (
    <div className="relative flex-1" ref={ref}>
      <Label className="text-sm font-semibold text-foreground mb-1.5 block">
        {label}
      </Label>
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-primary" />
        <Input
          className="pl-10 h-12 bg-white border-border text-foreground font-medium placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          placeholder={placeholder}
          value={query}
          onChange={(e) => { setQuery(e.target.value); setSelected(false); onChange(''); }}
          onFocus={() => !selected && suggestions.length > 0 && setOpen(true)}
        />
      </div>
      {hint && !query && (
        <p className="text-xs text-muted-foreground mt-1">{hint}</p>
      )}
      {open && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-border rounded-lg shadow-lg max-h-56 overflow-y-auto">
          {suggestions.map((s) => (
            <button
              key={s.id}
              type="button"
              className="w-full text-left px-4 py-3 hover:bg-primary/5 text-sm flex justify-between items-center border-b border-border last:border-0 transition-colors"
              onClick={() => { setQuery(`${s.name} (${s.code})`); setSelected(true); onChange(s.code); setOpen(false); setSuggestions([]); }}
            >
              <div>
                <span className="font-medium text-foreground">{s.name}</span>
                {s.city && s.city !== s.name && (
                  <span className="text-muted-foreground ml-1.5">- {s.city}</span>
                )}
              </div>
              <span className="text-primary font-mono text-xs font-bold bg-primary/10 px-2 py-0.5 rounded">{s.code}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const popularRoutes = [
  { from: 'NDLS', to: 'BCT', label: 'Delhi → Mumbai' },
  { from: 'NDLS', to: 'HWH', label: 'Delhi → Kolkata' },
  { from: 'SBC', to: 'MAS', label: 'Bangalore → Chennai' },
];

export default function Home() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (from && to && date) {
      navigate(`/search?from=${from}&to=${to}&date=${date}`);
    }
  };

  const swapStations = () => {
    setFrom(to);
    setTo(from);
  };

  const handleQuickRoute = (route) => {
    navigate(`/search?from=${route.from}&to=${route.to}&date=${date}`);
  };

  return (
    <div className="flex flex-col">
      {/* Hero + Search — compact, form-first */}
      <section className="pt-6 pb-10 md:pt-10 md:pb-14">
        <div className="max-w-3xl mx-auto px-4">
          <div className="mb-6 md:mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground leading-tight mb-2">
              Book Train Tickets
            </h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Search across 10,000+ routes. Check availability and book instantly.
            </p>
          </div>

          {/* Search Form — the hero */}
          <Card className="bg-white border-border shadow-lg">
            <CardContent className="p-5 md:p-6">
              <form onSubmit={handleSearch} className="space-y-5">
                {/* Station inputs row */}
                <div className="flex flex-col md:flex-row gap-3 md:gap-2 items-stretch md:items-end">
                  <StationAutocomplete
                    label="From"
                    value={from}
                    onChange={setFrom}
                    placeholder="City or station code"
                    hint="Type 2+ letters to search (e.g. Delhi, NDLS)"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="self-center md:self-end h-10 w-10 md:h-12 md:w-12 border-2 border-primary/40 bg-primary/5 text-primary hover:bg-primary hover:text-white hover:border-primary transition-all rounded-full shrink-0"
                    onClick={swapStations}
                    title="Swap stations"
                  >
                    <ArrowRightLeft className="h-4 w-4" />
                  </Button>
                  <StationAutocomplete
                    label="To"
                    value={to}
                    onChange={setTo}
                    placeholder="City or station code"
                    hint="Type 2+ letters to search (e.g. Mumbai, BCT)"
                  />
                </div>

                {/* Date + Submit row */}
                <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end">
                  <div className="flex-1">
                    <Label className="text-sm font-semibold text-foreground mb-1.5 block">
                      Travel Date
                    </Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-primary" />
                      <Input
                        type="date"
                        className="pl-10 h-12 bg-white border-border text-foreground font-medium focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        required
                      />
                    </div>
                  </div>
                  <Button
                    type="submit"
                    size="lg"
                    className="h-12 px-10 bg-primary text-white hover:bg-primary/90 font-bold text-base tracking-wide shadow-md shadow-primary/25 hover:shadow-lg hover:shadow-primary/30 transition-all"
                    disabled={!from || !to}
                  >
                    <Search className="h-5 w-5 mr-2" />
                    Search Trains
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Popular Routes */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">Popular:</span>
            {popularRoutes.map((route) => (
              <button
                key={route.label}
                type="button"
                onClick={() => handleQuickRoute(route)}
                className="text-xs px-3 py-1.5 rounded-full border border-border bg-white text-foreground font-medium hover:border-primary hover:text-primary hover:bg-primary/5 transition-colors"
              >
                {route.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Features — compact grid */}
      <section className="py-10 border-t border-border bg-secondary/30">
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { icon: Clock, title: 'Real-time Availability', desc: 'Live seat counts across all classes — Sleeper, 3AC, 2AC, 1AC' },
              { icon: Shield, title: 'Secure Payments', desc: 'UPI, cards, and net banking with instant confirmation' },
              { icon: Users, title: 'Waitlist & RAC', desc: 'Auto-promotion from waitlist when seats free up' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex gap-3 p-4 rounded-lg">
                <div className="shrink-0 h-10 w-10 flex items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-sm mb-0.5">{title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust signals */}
      <section className="py-8 border-t border-border">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Train className="h-4 w-4 text-primary" />
              <span className="font-medium">10+ Stations</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              <span className="font-medium">Secure Booking</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <span className="font-medium">Instant e-Tickets</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <span className="font-medium">24/7 PNR Tracking</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
