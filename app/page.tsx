import Preloader from "@/components/Preloader";
import Ambient from "@/components/Ambient";
import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import About from "@/components/About";
import DressCode from "@/components/DressCode";
import Gallery from "@/components/Gallery";
import Programme from "@/components/Programme";
import Reservation from "@/components/Reservation";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Preloader />
      <Ambient />
      <Nav />
      <main className="relative">
        <Hero />
        <About />
        <DressCode />
        <Gallery />
        <Programme />
        <Reservation />
      </main>
      <Footer />
    </>
  );
}
