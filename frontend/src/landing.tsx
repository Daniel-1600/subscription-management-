import "./landing.css";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

class LandingPage {
  private previewChart: Chart | null = null;

  constructor() {
    this.initializeChart();
    this.setupEventListeners();
    this.setupNavigation();
  }

  private initializeChart() {
    const canvas = document.getElementById("previewChart") as HTMLCanvasElement;
    if (!canvas) return;

    this.previewChart = new Chart(canvas, {
      type: "line",
      data: {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
        datasets: [
          {
            label: "Revenue",
            data: [15000, 23000, 18000, 29000, 26000, 35000],
            borderColor: "#3b82f6",
            backgroundColor: "rgba(59, 130, 246, 0.1)",
            tension: 0.4,
            fill: true,
            borderWidth: 2,
            pointRadius: 0,
            pointHoverRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
        },
        scales: {
          x: {
            display: false,
          },
          y: {
            display: false,
          },
        },
        elements: {
          point: {
            backgroundColor: "#3b82f6",
          },
        },
      },
    });
  }

  private setupEventListeners() {
    // Dashboard button
    document.getElementById("dashboardBtn")?.addEventListener("click", () => {
      window.location.href = "./index.html";
    });

    // Get Started button
    document.getElementById("getStartedBtn")?.addEventListener("click", () => {
      window.location.href = "./index.html";
    });

    // Live Demo button
    document.getElementById("liveDemoBtn")?.addEventListener("click", () => {
      window.location.href = "./index.html";
    });

    // Start Trial button
    document.getElementById("startTrialBtn")?.addEventListener("click", () => {
      window.location.href = "./index.html";
    });

    // Contact Sales button
    document
      .getElementById("contactSalesBtn")
      ?.addEventListener("click", () => {
        alert(
          "Contact Sales: sales@subscriptionpro.com or call +1 (555) 123-4567"
        );
      });

    // Pricing buttons
    document.querySelectorAll(".pricing-card .btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (btn.textContent?.includes("Contact Sales")) {
          alert(
            "Contact Sales: sales@subscriptionpro.com or call +1 (555) 123-4567"
          );
        } else {
          window.location.href = "./index.html";
        }
      });
    });
  }

  private setupNavigation() {
    // Mobile menu toggle
    const navToggle = document.getElementById("navToggle");
    const navMenu = document.querySelector(".nav-menu");

    navToggle?.addEventListener("click", () => {
      navMenu?.classList.toggle("active");
    });

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute("href") || "");
        if (target) {
          target.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      });
    });

    // Navbar background on scroll
    window.addEventListener("scroll", () => {
      const navbar = document.querySelector(".navbar");
      if (window.scrollY > 50) {
        navbar?.classList.add("scrolled");
      } else {
        navbar?.classList.remove("scrolled");
      }
    });

    // Intersection Observer for animations
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animate-in");
        }
      });
    }, observerOptions);

    // Observe feature cards
    document.querySelectorAll(".feature-card").forEach((card) => {
      observer.observe(card);
    });

    // Observe pricing cards
    document.querySelectorAll(".pricing-card").forEach((card) => {
      observer.observe(card);
    });
  }
}

// Initialize landing page when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new LandingPage();
});

// Add some interactive effects
document.addEventListener("mousemove", (e) => {
  const hero = document.querySelector(".hero") as HTMLElement;
  if (!hero) return;

  const { clientX, clientY } = e;
  const { innerWidth, innerHeight } = window;

  const xPos = (clientX / innerWidth) * 100;
  const yPos = (clientY / innerHeight) * 100;

  hero.style.background = `
    radial-gradient(
      ellipse at ${xPos}% ${yPos}%, 
      rgba(59, 130, 246, 0.15) 0%, 
      transparent 70%
    )
  `;
});

// Add typing effect to hero title
const heroTitle = document.querySelector(".hero-title");
if (heroTitle) {
  const originalText = heroTitle.innerHTML;
  heroTitle.innerHTML = "";

  let i = 0;
  const typeWriter = () => {
    if (i < originalText.length) {
      heroTitle.innerHTML += originalText.charAt(i);
      i++;
      setTimeout(typeWriter, 50);
    }
  };

  setTimeout(typeWriter, 1000);
}
