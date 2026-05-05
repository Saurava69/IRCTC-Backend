import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { UserPlus, AlertCircle, Train } from 'lucide-react';

export default function Register() {
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md animate-fade-up">
        <div className="text-center mb-8">
          <div className="inline-flex p-3 rounded-xl bg-primary/10 border border-primary/20 mb-4">
            <Train className="h-6 w-6 text-primary" />
          </div>
          <h1 className="font-[var(--font-display)] text-3xl text-foreground mb-2">Create Account</h1>
          <p className="text-muted-foreground text-sm">Join RailBook and start booking</p>
        </div>

        <Card className="bg-card border-border shadow-lg overflow-hidden">
          <div className="h-0.5 bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <Alert variant="destructive" className="bg-destructive/10 border-destructive/20">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Full Name</Label>
                <Input
                  placeholder="Your full name"
                  className="h-12 bg-secondary/50 border-border/50 focus:border-primary/50 focus:bg-secondary transition-all duration-200"
                  value={form.fullName}
                  onChange={update('fullName')}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Email</Label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  className="h-12 bg-secondary/50 border-border/50 focus:border-primary/50 focus:bg-secondary transition-all duration-200"
                  value={form.email}
                  onChange={update('email')}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Phone (optional)</Label>
                <Input
                  type="tel"
                  placeholder="9876543210"
                  className="h-12 bg-secondary/50 border-border/50 focus:border-primary/50 focus:bg-secondary transition-all duration-200"
                  value={form.phone}
                  onChange={update('phone')}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Password</Label>
                <Input
                  type="password"
                  placeholder="Min 6 characters"
                  className="h-12 bg-secondary/50 border-border/50 focus:border-primary/50 focus:bg-secondary transition-all duration-200"
                  value={form.password}
                  onChange={update('password')}
                  required
                  minLength={6}
                />
              </div>
              <Button
                type="submit"
                className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold tracking-wide shadow-lg shadow-primary/20 transition-all duration-200"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Creating account...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    Create Account
                  </span>
                )}
              </Button>
              <p className="text-center text-sm text-muted-foreground pt-2">
                Already have an account?{' '}
                <Link to="/login" className="text-primary font-medium hover:text-primary/80 transition-colors">
                  Login
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
