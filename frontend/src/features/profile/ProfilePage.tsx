import {
  AudioWaveform,
  Bot,
  Cpu,
  GraduationCap,
  HeartPulse,
  Layers,
  MonitorSmartphone,
  UserRound,
} from 'lucide-react'
import { PageSection } from '@/components/layout/PageSection'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { LinkedinMark } from '@/features/profile/components/BrandIcons'
import { ProjectCard, type Project } from '@/features/profile/components/ProjectCard'
import { SkillCard, type SkillLevel } from '@/features/profile/components/SkillCard'

const LINKEDIN_URL = 'https://www.linkedin.com/in/radu-mihai-matei-290a201a3/'
const GITHUB_USER = 'https://github.com/RaduMatei04'

const SKILLS: Array<{
  icon: typeof Cpu
  name: string
  level: SkillLevel
  levelLabel: string
  description: string
}> = [
  {
    icon: Cpu,
    name: 'Sisteme embedded',
    level: 2,
    levelLabel: 'Intermediar',
    description:
      'Microcontrolere ESP32 și STM32, senzori pe I2C și ADC, comunicație prin MQTT și BLE.',
  },
  {
    icon: Layers,
    name: 'Dezvoltare software',
    level: 1,
    levelLabel: 'Începător',
    description:
      'Aplicații cu bază de date și servicii care comunică între ele, construite în cadrul proiectelor de facultate.',
  },
  {
    icon: MonitorSmartphone,
    name: 'Frontend development',
    level: 1,
    levelLabel: 'Începător',
    description:
      'Interfețe web cu React și TypeScript, componente reutilizabile și stilizare cu Tailwind.',
  },
]

const PROJECTS: Project[] = [
  {
    name: 'Robot_Arm_ESP32',
    icon: Bot,
    description:
      'Mână robotică acționată de servomotoare SG90, controlată de un ESP32 programat în Arduino. Un sistem de computer vision în Python detectează pozițiile degetelor și le transformă în comenzi, replicând mișcarea mâinii în timp real.',
    tags: ['ESP32', 'Arduino', 'Python', 'Computer vision'],
    url: 'https://github.com/RaduMatei04/Robot_Arm_ESP32',
    stars: 1,
    featured: true,
  },
  {
    name: 'Oximetru STM32',
    icon: HeartPulse,
    description:
      'Pulsoximetru construit în jurul senzorului MAX30102 și al unui microcontroler STM32. Măsoară saturația de oxigen din sânge și pulsul, iar datele și erorile de sistem sunt transmise prin BLE.',
    tags: ['STM32', 'MAX30102', 'BLE', 'STM32CubeIDE'],
    url: 'https://github.com/RaduMatei04/Oximetru---STM32-',
    stars: 1,
  },
  {
    name: 'Extragerea semnalului vocal din zgomot',
    icon: AudioWaveform,
    description:
      'Proiect MATLAB de reducere a zgomotului din semnale audio prin STFT și spectral subtraction. Estimează zgomotul din cadrele inițiale, îl elimină în domeniul frecvență și reconstruiește semnalul prin ISTFT.',
    tags: ['MATLAB', 'STFT', 'Procesare de semnal'],
    url: 'https://github.com/RaduMatei04/Metode-avansate-de-extragere-a-semnalului-vocal-din-zgomot',
    stars: 1,
  },
]

export function ProfilePage() {
  return (
    <div className="space-y-12">
      {/* Cardul de prezentare: cel mai intens colorat element din aplicație. */}
      <Card className="overflow-hidden bg-gradient-to-br from-brand/12 via-card to-card ring-2 ring-brand/40 transition-all duration-200 hover:shadow-xl hover:shadow-brand/25 hover:ring-brand/70">
        <CardContent className="flex flex-col items-start gap-6 py-2 sm:flex-row sm:items-center">
          <span
            aria-hidden
            className="flex size-20 shrink-0 items-center justify-center rounded-2xl bg-brand/15 ring-2 ring-brand/50"
          >
            <UserRound className="size-10 text-brand" />
          </span>

          <div className="flex-1 space-y-3">
            <div className="space-y-1.5">
              <p className="font-heading text-2xl font-semibold tracking-tight">Radu Matei</p>
              <Badge className="bg-brand text-background">Dezvoltator</Badge>
            </div>

            <p className="flex items-start gap-2 text-sm text-muted-foreground">
              <GraduationCap className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
              Viitor absolvent al Facultății de Electronică, Telecomunicații și Tehnologia
              Informației, Universitatea Politehnica din București.
            </p>
          </div>

          <Button
            render={<a href={LINKEDIN_URL} target="_blank" rel="noreferrer" />}
            nativeButton={false}
            role="link"
            className="gap-2 shadow-lg shadow-brand/30 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-brand/40"
          >
            <LinkedinMark className="size-4" />
            LinkedIn
          </Button>
        </CardContent>
      </Card>

      <PageSection
        title="Competențe"
        description="Nivelul de experiență pe fiecare direcție."
        columns={3}
      >
        {SKILLS.map((skill) => (
          <SkillCard key={skill.name} {...skill} />
        ))}
      </PageSection>

      <PageSection
        title="Proiecte"
        description="Lucrări publicate pe GitHub. Fiecare card deschide depozitul."
        columns={2}
        action={
          <Button
            variant="outline"
            size="sm"
            render={<a href={GITHUB_USER} target="_blank" rel="noreferrer" />}
            nativeButton={false}
            role="link"
            className="border-brand/40 text-brand hover:border-brand hover:bg-brand/10 hover:text-brand"
          >
            Toate proiectele
          </Button>
        }
      >
        {PROJECTS.map((project) => (
          <ProjectCard key={project.name} project={project} />
        ))}
      </PageSection>
    </div>
  )
}
