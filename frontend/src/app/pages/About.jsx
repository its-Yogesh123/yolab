import React from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Users, Activity, Globe, Zap, Target, Rocket } from "lucide-react";
import Footer from "@/shared/Footer";

// --- Mock Data ---

const stats = [
  { id: 1, name: "Active Users", value: "50K+", icon: Users },
  { id: 2, name: "Total Traffic", value: "2.5M", icon: Activity },
  { id: 3, name: "Countries Reached", value: "120+", icon: Globe },
  { id: 4, name: "Uptime", value: "99.9%", icon: Zap },
];

const timeline = [
  { year: "2025", title: "The Idea", description: "yolab was born out of a simple idea in a dorm room." },
  { year: "2026", title: "First Launch", description: "Launched our MVP and acquired our first 1,000 users." },
];

const team = [
  {
    name: "Yogesh Kumar",
    role: "Founder & CEO",
    bio: "Final Year NIT Kurukshetra undergraduate in Computer Engineering",
    image: "https://i.pravatar.cc/150?u=alex",
  },
];

const testimonials = [
  { name: "Yogesh Kumar", role: "Developer", text: "yolab completely transformed how I handle my daily workflows. Highly recommended!" },
  { name: "Jane Smith", role: "Product Manager", text: "The interface is slick, and the performance is unmatched. Great job team." },
  { name: "Mike Johnson", role: "Designer", text: "Finally, a tool that actually understands what users need. 10/10." },
  { name: "Emily Chen", role: "Startup Founder", text: "We scaled our operations 3x faster thanks to yolab's incredible infrastructure." },
  { name: "Chris Lee", role: "Freelancer", text: "I can't imagine going back to my old setup. yolab is the future." },
];

const testimonialCardStyles = [
  "bg-gradient-to-br from-blue-500/15 via-cyan-500/10 to-transparent border-blue-500/30",
  "bg-gradient-to-br from-violet-500/15 via-fuchsia-500/10 to-transparent border-violet-500/30",
  "bg-gradient-to-br from-emerald-500/15 via-lime-500/10 to-transparent border-emerald-500/30",
  "bg-gradient-to-br from-rose-500/15 via-orange-500/10 to-transparent border-rose-500/30",
  "bg-gradient-to-br from-sky-500/15 via-indigo-500/10 to-transparent border-sky-500/30",
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-24">
        
        {/* --- Hero / Who Are We --- */}
        <section className="text-center space-y-6">
          <Badge variant="secondary" className="px-4 py-1 text-sm rounded-full">
            About yolab
          </Badge>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
            Empowering the next generation <br className="hidden md:block" /> of digital creators.
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-muted-foreground">
            We are a team of passionate engineers, designers, and problem-solvers. 
            At yolab, we believe in breaking down barriers to technology and providing 
            seamless, high-performance tools for everyone.
          </p>
        </section>

        {/* --- Stats Section --- */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.id} className="border-none shadow-md bg-secondary/20">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.name}
                  </CardTitle>
                  <Icon className="h-5 w-5 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            );
          })}
        </section>

        {/* --- Our Goal & Timeline Section --- */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Our Goal */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Target className="h-8 w-8 text-primary" />
              <h2 className="text-3xl font-bold">Our Goal</h2>
            </div>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Our mission is to simplify the complex. We are building an ecosystem 
              where performance meets exceptional user experience. Whether you are a 
              solo developer or a large enterprise, yolab is designed to scale with you, 
              ensuring you spend less time configuring and more time creating.
            </p>
            <div className="flex items-center gap-3 mt-4 text-primary font-semibold">
              <Rocket className="h-5 w-5" />
              <span>Innovating everyday.</span>
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-8">
            <h2 className="text-3xl font-bold">Our Journey</h2>
            <div className="space-y-6 border-l-2 border-border pl-6 ml-3">
              {timeline.map((item, index) => (
                <div key={index} className="relative">
                  {/* Timeline dot */}
                  <span className="absolute -left-[35px] flex h-5 w-5 items-center justify-center rounded-full bg-primary ring-4 ring-background"></span>
                  <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                    {item.year} <Badge variant="outline">{item.title}</Badge>
                  </h3>
                  <p className="text-muted-foreground mt-2">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* --- Team / Founders Section --- */}
        <section className="space-y-10">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold">Meet the Founders</h2>
            <p className="text-muted-foreground">The minds behind yolab.</p>
          </div>
          <div className="grid grid-cols-1 gap-8 max-w-md mx-auto place-items-center">
            {team.map((member, idx) => (
              <Card key={idx} className="w-full flex flex-col items-center text-center p-6 border-border shadow-sm">
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarImage src={member.image} alt={member.name} />
                  <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <CardHeader className="p-0 mb-2">
                  <CardTitle>{member.name}</CardTitle>
                  <CardDescription className="font-medium text-primary">
                    {member.role}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0 text-muted-foreground">
                  {member.bio}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* --- User Feedback (Moving Cards) --- */}
        <section className="space-y-10 overflow-hidden py-10">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold">Loved by Users Worldwide</h2>
            <p className="text-muted-foreground">Don't just take our word for it.</p>
          </div>
          
          {/* Marquee Container */}
          <div className="relative flex w-full overflow-hidden bg-background">
            {/* Fade gradients on edges */}
            <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-1/6 bg-gradient-to-r from-background to-transparent"></div>
            <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-1/6 bg-gradient-to-l from-background to-transparent"></div>
            
            <div className="flex animate-marquee gap-6 whitespace-nowrap hover:[animation-play-state:paused]">
              {/* Render array twice to create seamless loop effect */}
              {[...testimonials, ...testimonials].map((review, i) => (
                <Card
                  key={i}
                  className={`w-[350px] shrink-0 border shadow-sm backdrop-blur-sm ${testimonialCardStyles[i % testimonialCardStyles.length]}`}
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{review.name}</CardTitle>
                    <CardDescription>{review.role}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground text-wrap">
                      "{review.text}"
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

      </div>
      <Footer />
    </div>
  );
}
