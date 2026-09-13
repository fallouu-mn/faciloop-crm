import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  ArrowLeft, ShieldCheck, User, Phone, Briefcase, BarChart3,
  Monitor, Target, Lock, RefreshCw, Bell, Bug,
  Clock, Eye, Pencil, Trash2, Download, Ban, Cookie, Mail,
  MessageCircle, Globe
} from 'lucide-react';
import { FaciloopBrand } from '../../components/common/FaciloopBrand';
import { ThemeToggle } from '../../components/common/ThemeToggle';

export function PrivacyContent({ embedded = false }: { embedded?: boolean }) {
  const { t } = useTranslation('legal');

  const dataItems = t('privacy.sections.dataCollected.items', { returnObjects: true }) as string[];
  const purposeItems = t('privacy.sections.purpose.items', { returnObjects: true }) as string[];
  const rightsItems = t('privacy.sections.rights.items', { returnObjects: true }) as string[];

  const dataIcons = [User, Phone, Briefcase, BarChart3, Monitor];
  const purposeIcons = [Lock, Target, RefreshCw, Bell, Bug];
  const rightsIcons = [Eye, Pencil, Trash2, Download, Ban];

  return (
    <div className={`space-y-8${!embedded ? ' max-w-3xl mx-auto px-4 py-8' : ''}`}>
      {!embedded && (
        <>
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
            <h1 className="text-2xl font-bold mb-2">{t('privacy.title')}</h1>
            <p className="text-sm text-muted-foreground">{t('privacy.lastUpdate')}</p>
          </div>
        </>
      )}

      <section className="rounded-2xl border-2 border-primary/20 bg-primary/5 p-5 space-y-3">
        <div className="flex items-center gap-3">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <h2 className="text-lg font-bold">{t('privacy.sections.intro.title')}</h2>
        </div>
        <p className="text-sm leading-relaxed">{t('privacy.sections.intro.text')}</p>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">{t('privacy.sections.dataCollected.title')}</h2>
        <p className="text-sm text-muted-foreground">{t('privacy.sections.dataCollected.text')}</p>
        <div className="grid grid-cols-2 gap-2.5">
          {Array.isArray(dataItems) && dataItems.map((item, i) => {
            const Icon = dataIcons[i] || Monitor;
            return (
              <div key={i} className="rounded-xl border bg-muted/20 p-3 space-y-2">
                <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
                  <Icon className="h-4 w-4" />
                </div>
                <p className="text-xs leading-relaxed">{item}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">{t('privacy.sections.purpose.title')}</h2>
        <p className="text-sm text-muted-foreground">{t('privacy.sections.purpose.text')}</p>
        <div className="relative space-y-0">
          {Array.isArray(purposeItems) && purposeItems.map((item, i) => {
            const Icon = purposeIcons[i] || Target;
            const isLast = i === purposeItems.length - 1;
            return (
              <div key={i} className="flex items-stretch gap-3">
                <div className="flex flex-col items-center">
                  <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-white z-10">
                    <Icon className="h-4 w-4" />
                  </div>
                  {!isLast && <div className="w-0.5 flex-1 min-h-[16px] bg-primary opacity-20" />}
                </div>
                <div className={`flex-1 ${isLast ? 'pb-0' : 'pb-3'}`}>
                  <p className="text-sm leading-relaxed pt-1">{item}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-xl border-2 border-sky-200 bg-sky-50 dark:bg-sky-900/10 dark:border-sky-800/30 p-4 space-y-2">
        <div className="flex items-center gap-2">
          <Lock className="h-5 w-5 text-sky-600 dark:text-sky-400" />
          <h2 className="text-lg font-semibold text-sky-800 dark:text-sky-300">{t('privacy.sections.storage.title')}</h2>
        </div>
        <p className="text-sm leading-relaxed">{t('privacy.sections.storage.text')}</p>
      </section>

      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-amber-600" />
          <h2 className="text-lg font-semibold">{t('privacy.sections.retention.title')}</h2>
        </div>
        <div className="rounded-xl border bg-amber-50/50 dark:bg-amber-900/10 p-4">
          <p className="text-sm leading-relaxed">{t('privacy.sections.retention.text')}</p>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">{t('privacy.sections.rights.title')}</h2>
        <p className="text-sm text-muted-foreground">{t('privacy.sections.rights.text')}</p>
        <div className="space-y-2">
          {Array.isArray(rightsItems) && rightsItems.map((item, i) => {
            const Icon = rightsIcons[i] || Eye;
            return (
              <div key={i} className="flex items-start gap-3 rounded-lg border bg-muted/20 p-3">
                <div className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary text-white mt-0.5">
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <p className="flex-1 text-sm leading-relaxed pt-0.5">{item}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-xl border-2 border-emerald-200 bg-emerald-50/50 dark:bg-emerald-900/10 dark:border-emerald-800/30 p-4 space-y-2">
        <div className="flex items-center gap-2">
          <Cookie className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          <h2 className="text-lg font-semibold text-emerald-800 dark:text-emerald-300">{t('privacy.sections.cookies.title')}</h2>
        </div>
        <p className="text-sm leading-relaxed">{t('privacy.sections.cookies.text')}</p>
      </section>

      <section className="rounded-xl border bg-muted/30 p-4 space-y-3">
        <h2 className="text-lg font-semibold">{t('privacy.sections.contact.title')}</h2>
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

      {!embedded && (
        <div className="pt-6 border-t border-border text-center">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Faciloopro - Digit'Advisor
          </p>
        </div>
      )}
    </div>
  );
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <PrivacyContent />
    </div>
  );
}
