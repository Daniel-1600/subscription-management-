import "./dashboard.css";
import { Chart, registerables } from "chart.js";
import axios from "axios";

Chart.register(...registerables);

interface Subscription {
  id: number;
  user_id: number;
  user_name: string;
  user_email: string;
  plan_id: number;
  plan_name: string;
  status: "active" | "trial" | "cancelled" | "expired";
  start_date: string;
  end_date: string;
  amount: number;
  currency: string;
  billing_cycle: string;
  created_at: string;
  updated_at: string;
}

interface Plan {
  id: number;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: string;
  features: string[];
  active: boolean;
}

interface Analytics {
  total_subscriptions: number;
  active_subscriptions: number;
  trial_subscriptions: number;
  cancelled_subscriptions: number;
  monthly_revenue: number;
  yearly_revenue: number;
  churn_rate: number;
  average_revenue_per_user: number;
  new_subscriptions_today: number;
  cancellations_today: number;
}

interface RealtimeData {
  analytics: Analytics;
  recent_subscriptions: Subscription[];
  timestamp: string;
}

class SubscriptionDashboard {
  private ws: WebSocket | null = null;
  private reconnectInterval = 3000;
  private statusChart: Chart | null = null;
  private subscriptions: Subscription[] = [];
  private plans: Plan[] = [];
  private currentPage = 1;
  private itemsPerPage = 10;
  private totalItems = 0;
  private searchQuery = "";
  private statusFilter = "";

  constructor() {
    this.initializeCharts();
    this.setupEventListeners();
    this.loadInitialData();
    this.connectWebSocket();
  }

  private async loadInitialData() {
    try {
      // Load plans
      const plansResponse = await axios.get<Plan[]>(
        "http://localhost:8080/api/plans"
      );
      this.plans = plansResponse.data;
      this.populatePlanSelect();

      // Load subscriptions
      await this.loadSubscriptions();

      // Load analytics
      const analyticsResponse = await axios.get<Analytics>(
        "http://localhost:8080/api/analytics"
      );
      this.updateAnalytics(analyticsResponse.data);
    } catch (error) {
      console.error("Error loading initial data:", error);
    }
  }

  private async loadSubscriptions() {
    try {
      const statusQuery = this.statusFilter
        ? `&status=${this.statusFilter}`
        : "";
      const searchQuery = this.searchQuery
        ? `&search=${encodeURIComponent(this.searchQuery)}`
        : "";
      const response = await axios.get(
        `http://localhost:8080/api/subscriptions?page=${this.currentPage}&limit=${this.itemsPerPage}${statusQuery}${searchQuery}`
      );
      this.subscriptions = response.data.subscriptions || [];
      this.totalItems = response.data.total || 0;
      this.updateSubscriptionsTable();
      this.updatePagination();
    } catch (error) {
      console.error("Error loading subscriptions:", error);
    }
  }

  private connectWebSocket() {
    const statusElement = document.getElementById("connectionStatus")!;
    statusElement.textContent = "Connecting...";
    statusElement.className = "connection-status connecting";

    this.ws = new WebSocket("ws://localhost:8080/ws");

    this.ws.onopen = () => {
      console.log("Connected to WebSocket");
      statusElement.innerHTML = '<i class="fas fa-circle"></i> Connected';
      statusElement.className = "connection-status connected";
    };

    this.ws.onmessage = (event) => {
      const data: RealtimeData = JSON.parse(event.data);
      this.updateAnalytics(data.analytics);
      this.updateRecentSubscriptions(data.recent_subscriptions);
    };

    this.ws.onclose = () => {
      console.log("WebSocket connection closed");
      statusElement.innerHTML = '<i class="fas fa-circle"></i> Disconnected';
      statusElement.className = "connection-status disconnected";
      this.reconnectWebSocket();
    };

    this.ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      statusElement.innerHTML = '<i class="fas fa-circle"></i> Error';
      statusElement.className = "connection-status disconnected";
    };
  }

  private reconnectWebSocket() {
    setTimeout(() => {
      console.log("Attempting to reconnect...");
      this.connectWebSocket();
    }, this.reconnectInterval);
  }

  private initializeCharts() {
    // Revenue Chart
    const revenueCtx = document.getElementById(
      "revenueChart"
    ) as HTMLCanvasElement;
    new Chart(revenueCtx, {
      type: "line",
      data: {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
        datasets: [
          {
            label: "Monthly Revenue",
            data: [12000, 19000, 15000, 25000, 22000, 30000],
            borderColor: "#3b82f6",
            backgroundColor: "rgba(59, 130, 246, 0.1)",
            tension: 0.4,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: {
              color: "#f8fafc",
            },
          },
        },
        scales: {
          x: {
            ticks: {
              color: "#94a3b8",
            },
            grid: {
              color: "#374151",
            },
          },
          y: {
            beginAtZero: true,
            ticks: {
              color: "#94a3b8",
              callback: function (value: string | number) {
                return "$" + (value as number).toLocaleString();
              },
            },
            grid: {
              color: "#374151",
            },
          },
        },
      },
    });
    // Status Chart
    const statusCtx = document.getElementById(
      "statusChart"
    ) as HTMLCanvasElement;
    this.statusChart = new Chart(statusCtx, {
      type: "doughnut",
      data: {
        labels: ["Active", "Trial", "Cancelled", "Expired"],
        datasets: [
          {
            data: [65, 20, 10, 5],
            backgroundColor: ["#10b981", "#f59e0b", "#ef4444", "#64748b"],
            borderWidth: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              color: "#f8fafc",
              padding: 20,
            },
          },
        },
      },
    });
  }

  private setupEventListeners() {
    // Add subscription button
    document
      .getElementById("addSubscriptionBtn")
      ?.addEventListener("click", () => {
        this.showModal();
      });

    // Modal close buttons
    document.getElementById("closeModal")?.addEventListener("click", () => {
      this.hideModal();
    });

    document.getElementById("cancelForm")?.addEventListener("click", () => {
      this.hideModal();
    });

    // Form submission
    document
      .getElementById("subscriptionForm")
      ?.addEventListener("submit", (e) => {
        e.preventDefault();
        this.handleFormSubmission();
      });

    // Search functionality
    document.getElementById("searchInput")?.addEventListener("input", (e) => {
      this.searchQuery = (e.target as HTMLInputElement).value;
      this.currentPage = 1;
      this.loadSubscriptions();
    });

    // Status filter
    document.getElementById("statusFilter")?.addEventListener("change", (e) => {
      this.statusFilter = (e.target as HTMLSelectElement).value;
      this.currentPage = 1;
      this.loadSubscriptions();
    });

    // Pagination
    document.getElementById("prevPage")?.addEventListener("click", () => {
      if (this.currentPage > 1) {
        this.currentPage--;
        this.loadSubscriptions();
      }
    });

    document.getElementById("nextPage")?.addEventListener("click", () => {
      const maxPage = Math.ceil(this.totalItems / this.itemsPerPage);
      if (this.currentPage < maxPage) {
        this.currentPage++;
        this.loadSubscriptions();
      }
    });

    // Modal click outside to close
    document
      .getElementById("subscriptionModal")
      ?.addEventListener("click", (e) => {
        if (e.target === e.currentTarget) {
          this.hideModal();
        }
      });
  }

  private updateAnalytics(analytics: Analytics) {
    document.getElementById(
      "monthlyRevenue"
    )!.textContent = `$${analytics.monthly_revenue.toLocaleString()}`;
    document.getElementById("activeSubscribers")!.textContent =
      analytics.active_subscriptions.toString();
    document.getElementById(
      "churnRate"
    )!.textContent = `${analytics.churn_rate.toFixed(1)}%`;
    document.getElementById(
      "arpu"
    )!.textContent = `$${analytics.average_revenue_per_user.toFixed(2)}`;
    document.getElementById("trialUsers")!.textContent =
      analytics.trial_subscriptions.toString();
    document.getElementById("newToday")!.textContent =
      analytics.new_subscriptions_today.toString();

    // Update status chart
    if (this.statusChart) {
      this.statusChart.data.datasets[0].data = [
        analytics.active_subscriptions,
        analytics.trial_subscriptions,
        analytics.cancelled_subscriptions,
        analytics.total_subscriptions -
          analytics.active_subscriptions -
          analytics.trial_subscriptions -
          analytics.cancelled_subscriptions,
      ];
      this.statusChart.update("none");
    }
  }

  private updateRecentSubscriptions(subscriptions: Subscription[]) {
    // This could update a recent subscriptions sidebar or ticker
    console.log("Recent subscriptions updated:", subscriptions);
  }

  private updateSubscriptionsTable() {
    const tbody = document.getElementById("subscriptionsTableBody")!;
    tbody.innerHTML = "";

    this.subscriptions.forEach((subscription) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>
          <div>
            <div style="font-weight: 500;">${subscription.user_name}</div>
            <div style="font-size: 0.75rem; color: var(--text-muted);">${
              subscription.user_email
            }</div>
          </div>
        </td>
        <td>${subscription.plan_name}</td>
        <td>
          <span class="status-badge ${subscription.status}">${
        subscription.status
      }</span>
        </td>
        <td>$${subscription.amount} / ${subscription.billing_cycle}</td>
        <td>${new Date(subscription.start_date).toLocaleDateString()}</td>
        <td>${new Date(subscription.end_date).toLocaleDateString()}</td>
        <td>
          <button class="btn btn-sm btn-outline" onclick="editSubscription(${
            subscription.id
          })">
            <i class="fas fa-edit"></i> Edit
          </button>
          <button class="btn btn-sm btn-outline" onclick="deleteSubscription(${
            subscription.id
          })" style="margin-left: 0.5rem;">
            <i class="fas fa-trash"></i> Delete
          </button>
        </td>
      `;
      tbody.appendChild(row);
    });
  }

  private updatePagination() {
    const maxPage = Math.ceil(this.totalItems / this.itemsPerPage);
    const start = (this.currentPage - 1) * this.itemsPerPage + 1;
    const end = Math.min(this.currentPage * this.itemsPerPage, this.totalItems);

    document.getElementById(
      "paginationInfo"
    )!.textContent = `${start}-${end} of ${this.totalItems}`;

    const prevBtn = document.getElementById("prevPage") as HTMLButtonElement;
    const nextBtn = document.getElementById("nextPage") as HTMLButtonElement;

    prevBtn.disabled = this.currentPage === 1;
    nextBtn.disabled = this.currentPage === maxPage;
  }

  private populatePlanSelect() {
    const select = document.getElementById("planSelect") as HTMLSelectElement;
    select.innerHTML = "";

    this.plans.forEach((plan) => {
      const option = document.createElement("option");
      option.value = plan.id.toString();
      option.textContent = `${plan.name} - $${plan.price}/${plan.interval}`;
      select.appendChild(option);
    });
  }

  private showModal(subscription?: Subscription) {
    const modal = document.getElementById("subscriptionModal")!;
    const title = document.getElementById("modalTitle")!;
    const form = document.getElementById("subscriptionForm") as HTMLFormElement;

    if (subscription) {
      title.textContent = "Edit Subscription";
      this.populateForm(subscription);
    } else {
      title.textContent = "Add New Subscription";
      form.reset();
    }

    modal.classList.add("active");
  }

  private hideModal() {
    const modal = document.getElementById("subscriptionModal")!;
    modal.classList.remove("active");
  }

  private populateForm(subscription: Subscription) {
    (document.getElementById("userName") as HTMLInputElement).value =
      subscription.user_name;
    (document.getElementById("userEmail") as HTMLInputElement).value =
      subscription.user_email;
    (document.getElementById("planSelect") as HTMLSelectElement).value =
      subscription.plan_id.toString();
    (document.getElementById("status") as HTMLSelectElement).value =
      subscription.status;
  }

  private async handleFormSubmission() {
    const subscription = {
      user_name: (document.getElementById("userName") as HTMLInputElement)
        .value,
      user_email: (document.getElementById("userEmail") as HTMLInputElement)
        .value,
      plan_id: parseInt(
        (document.getElementById("planSelect") as HTMLSelectElement).value
      ),
      status: (document.getElementById("status") as HTMLSelectElement).value,
    };

    try {
      await axios.post("http://localhost:8080/api/subscriptions", subscription);
      this.hideModal();
      this.loadSubscriptions();
    } catch (error) {
      console.error("Error saving subscription:", error);
    }
  }
}

// Initialize dashboard when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new SubscriptionDashboard();
});

// Extend Window interface to include global functions
declare global {
  interface Window {
    editSubscription: (id: number) => void;
    deleteSubscription: (id: number) => Promise<void>;
  }
}

// Global functions for table actions
window.editSubscription = (id: number) => {
  console.log("Edit subscription:", id);
};
window.deleteSubscription = async (id: number) => {
  if (confirm("Are you sure you want to delete this subscription?")) {
    try {
      await axios.delete(`http://localhost:8080/api/subscriptions/${id}`);
      // Reload subscriptions
      window.location.reload();
    } catch (error) {
      console.error("Error deleting subscription:", error);
    }
  }
};
