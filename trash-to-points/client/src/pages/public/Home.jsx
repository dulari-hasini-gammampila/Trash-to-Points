/**
 * Here's what this is for:
 * The public home page visitors see first—big headline, how the program works, sample rewards,
 * event info, budget snapshot, and buttons to sign up.
 *
 * How it fits in:
 * Opens at the site’s main web address. Other pages link from here.
 *
 * Why it matters:
 * This page sells the idea—if it’s confusing, fewer people will join.
 */
import { Link } from "react-router-dom";
import HeroSection from "../../components/landing/HeroSection";
import AboutSection from "../../components/landing/AboutSection";
import HowItWorksSection from "../../components/landing/HowItWorksSection";
import PublicRewardCard from "../../components/landing/RewardCard";
import HomeEventCard from "../../components/landing/EventCard";
import BudgetTable from "../../components/landing/BudgetTable";

export default function Home() {
  return (
    <div className="home-page">
      <HeroSection />

      <div className="home-split">
        <AboutSection />
        <HowItWorksSection />
      </div>

      <section id="rewards" className="home-section home-section--rewards">
        <h2 className="section-title">Rewards</h2>
        <div className="grid-3">
          <PublicRewardCard points={10} title="Clean Warrior Sticker" />
          <PublicRewardCard points={20} title="Free Breakfast" />
          <PublicRewardCard points={40} title="Eco-Friendly Gift" />
        </div>
      </section>

      <div className="home-split home-split--event-budget">
        <section className="home-section">
          <h2 className="section-title">Event</h2>
          <HomeEventCard />
        </section>
        <section className="home-section">
          <h2 className="section-title">Budget</h2>
          <BudgetTable />
        </section>
      </div>

      <section className="home-section home-section--cta">
        <div className="card home-cta-card">
          <h2 className="home-cta-title">Join us</h2>
          <p className="home-cta-lead">
            Join us in creating a cleaner, greener, and more rewarding community.
          </p>
          <Link to="/register" className="btn btn-primary">
            Register Now
          </Link>
        </div>
      </section>
    </div>
  );
}
