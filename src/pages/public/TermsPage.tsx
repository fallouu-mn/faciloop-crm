import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  ArrowLeft, FileText, Globe, Smartphone, WifiOff, UserCheck,
  ShieldAlert, Ban, CreditCard, Copyright, Scale, Gavel,
  XCircle, Mail, MessageCircle, AlertTriangle
} from 'lucide-react';
import { FaciloopBrand } from '../../components/common/FaciloopBrand';
import { ThemeToggle } from '../../components/common/ThemeToggle';

export default function TermsPage() {
  const { t } = useTranslation('legal');

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="p-2 rounded-lg hover:bg-muted transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <FaciloopBrand className="h-8" />
          </div>
          <ThemeToggle />
        </div>

        <div>
          <h1 className="text-2xl font-bold mb-2">{t('terms.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('terms.lastUpdate')}</p>
        </div>

        <section className="rounded-2xl border-2 border-primary/20 bg-primary/5 p-5 space-y-3">
          <div className="flex items-center gap-3">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white">
              <FileText className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-bold">{t('terms.sections.object.title')}</h2>
          </div>
          <p className="text-sm leading-relaxed">{t('terms.sections.object.text')}</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold">{t('terms.sections.access.title')}</h2>
          <div className="relative space-y-0">
            {[
              { icon: Smartphone, text: t('terms.sections.access.text').split('. ')[0] + '.' },
              { icon: Globe, text: t('terms.sections.access.text').split('. ').slice(1, 2).join('. ') + '.' },
              { icon: WifiOff, text: t('terms.sections.access.text').split('. ').slice(2).join('. ') },
            ].filter(s => s.text.trim().length > 1).map((step, i, arr) => {
              const isLast = i === arr.length - 1;
              return (
                <div key={i} className="flex items-stretch gap-3">
                  <div className="flex flex-col items-center">
                    <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-white z-10">
                      <step.icon className="h-4 w-4" />
                    </div>
                    {!isLast && <div className="w-0.5 flex-1 min-h-[16px] bg-primary opacity-20" />}
                  </div>
                  <div className={`flex-1 ${isLast ? 'pb-0' : 'pb-3'}`}>
                    <p className="text-sm leading-relaxed pt-1">{step.text}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-xl border-2 border-amber-200 bg-amber-50 dark:bg-amber-900/10 dark:border-amber-800/30 p-4 space-y-2">
          <div className="flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            <h2 className="text-lg font-semibold text-amber-800 dark:text-amber-300">{t('terms.sections.account.title')}</h2>
          </div>
          <p className="text-sm leading-relaxed">{t('terms.sections.account.text')}</p>
        </section>

        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-destructive" />
            <h2 className="text-lg font-semibold">{t('terms.sections.usage.title')}</h2>
          </div>
          <div className="flex items-start gap-3 rounded-lg border border-destructive/20 bg-destructive/5 p-3">
            <div className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-destructive text-white mt-0.5">
              <Ban className="h-3.5 w-3.5" />
            </div>
            <p className="flex-1 text-sm leading-relaxed pt-0.5">{t('terms.sections.usage.text')}</p>
          </div>
        </section>

        <section className="space-y-3">
          <div className="rounded-xl border bg-muted/20 p-4 space-y-2">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              <h2 className="text-base font-semibold">{t('terms.sections.subscription.title')}</h2>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{t('terms.sections.subscription.text')}</p>
          </div>
          <div className="rounded-xl border bg-muted/20 p-4 space-y-2">
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-destructive" />
              <h2 className="text-base font-semibold">{t('terms.sections.termination.title')}</h2>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{t('terms.sections.termination.text')}</p>
          </div>
        </section>

        <section className="rounded-xl border-2 border-violet-200 bg-violet-50/50 dark:bg-violet-900/10 dark:border-violet-800/30 p-4 space-y-2">
          <div className="flex items-center gap-2">
            <Copyright className="h-5 w-5 text-violet-600 dark:text-violet-400" />
            <h2 className="text-lg font-semibold text-violet-800 dark:text-violet-300">{t('terms.sections.ip.title')}</h2>
          </div>
          <p className="text-sm leading-relaxed">{t('terms.sections.ip.text')}</p>
        </section>

        <section className="rounded-xl border-2 border-amber-200 bg-amber-50 dark:bg-amber-900/10 dark:border-amber-800/30 p-4 space-y-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            <h2 className="text-lg font-semibold text-amber-800 dark:text-amber-300">{t('terms.sections.liability.title')}</h2>
          </div>
          <p className="text-sm leading-relaxed">{t('terms.sections.liability.text')}</p>
        </section>

        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Gavel className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">{t('terms.sections.law.title')}</h2>
          </div>
          <div className="flex items-start gap-3 rounded-lg border bg-primary/5 p-3">
            <div className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary text-white mt-0.5">
              <Scale className="h-3.5 w-3.5" />
            </div>
            <p className="flex-1 text-sm leading-relaxed pt-0.5">{t('terms.sections.law.text')}</p>
          </div>
        </section>

        <section className="rounded-xl border bg-muted/30 p-4 space-y-3">
          <h2 className="text-lg font-semibold">{t('terms.sections.contact.title')}</h2>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-4 w-4 text-primary" />
              <span>contact@digitadvisor.sn</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MessageCircle className="h-4 w-4 text-[#25D366]" />
              <span>+221 77 630 82 66</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Globe className="h-4 w-4 text-primary" />
              <span>www.digitadvisor.sn</span>
            </div>
          </div>
        </section>

        <div className="pt-6 border-t border-border text-center">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Faciloopro - Digit'Advisor
          </p>
        </div>
      </div>
    </div>
  );
}
