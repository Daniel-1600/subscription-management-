package main

import (
	"encoding/json"
	"log"
	"math/rand"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/gorilla/mux"
	"github.com/gorilla/websocket"
	"github.com/rs/cors"
)

type Subscription struct {
	ID           int       `json:"id"`
	UserID       int       `json:"user_id"`
	UserName     string    `json:"user_name"`
	UserEmail    string    `json:"user_email"`
	PlanID       int       `json:"plan_id"`
	PlanName     string    `json:"plan_name"`
	Status       string    `json:"status"` // active, cancelled, expired, trial
	StartDate    time.Time `json:"start_date"`
	EndDate      time.Time `json:"end_date"`
	Amount       float64   `json:"amount"`
	Currency     string    `json:"currency"`
	BillingCycle string    `json:"billing_cycle"` // monthly, yearly
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

type Plan struct {
	ID          int      `json:"id"`
	Name        string   `json:"name"`
	Description string   `json:"description"`
	Price       float64  `json:"price"`
	Currency    string   `json:"currency"`
	Interval    string   `json:"interval"` // monthly, yearly
	Features    []string `json:"features"`
	Active      bool     `json:"active"`
}

type Analytics struct {
	TotalSubscriptions     int     `json:"total_subscriptions"`
	ActiveSubscriptions    int     `json:"active_subscriptions"`
	TrialSubscriptions     int     `json:"trial_subscriptions"`
	CancelledSubscriptions int     `json:"cancelled_subscriptions"`
	MonthlyRevenue         float64 `json:"monthly_revenue"`
	YearlyRevenue          float64 `json:"yearly_revenue"`
	ChurnRate              float64 `json:"churn_rate"`
	AverageRevenuePerUser  float64 `json:"average_revenue_per_user"`
	NewSubscriptionsToday  int     `json:"new_subscriptions_today"`
	CancellationsToday     int     `json:"cancellations_today"`
}

type Recruiter struct {
	ID          int       `json:"id"`
	Name        string    `json:"name"`
	Email       string    `json:"email"`
	Company     string    `json:"company"`
	Position    string    `json:"position"`
	TechStack   []string  `json:"tech_stack"`   // e.g., ["JavaScript", "Golang"]
	Remote      bool      `json:"remote"`
	Location    string    `json:"location"`
	Description string    `json:"description"`
	ContactDate time.Time `json:"contact_date"`
	Status      string    `json:"status"`     // active, contacted, interview, hired, rejected
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type RealtimeData struct {
	Analytics     Analytics      `json:"analytics"`
	Subscriptions []Subscription `json:"recent_subscriptions"`
	Timestamp     string         `json:"timestamp"`
}

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

var (
	subscriptions []Subscription
	plans         []Plan
	recruiters    []Recruiter
	clients       = make(map[*websocket.Conn]bool)
	broadcast     = make(chan RealtimeData)
)

func init() {
	// Initialize sample data
	plans = []Plan{
		{ID: 1, Name: "Basic", Description: "Perfect for individuals", Price: 9.99, Currency: "USD", Interval: "monthly", Features: []string{"5 Projects", "10GB Storage", "Email Support"}, Active: true},
		{ID: 2, Name: "Pro", Description: "Great for small teams", Price: 29.99, Currency: "USD", Interval: "monthly", Features: []string{"Unlimited Projects", "100GB Storage", "Priority Support", "Advanced Analytics"}, Active: true},
		{ID: 3, Name: "Enterprise", Description: "For large organizations", Price: 99.99, Currency: "USD", Interval: "monthly", Features: []string{"Everything in Pro", "Unlimited Storage", "24/7 Phone Support", "Custom Integrations"}, Active: true},
		{ID: 4, Name: "Basic Yearly", Description: "Basic plan billed yearly", Price: 99.99, Currency: "USD", Interval: "yearly", Features: []string{"5 Projects", "10GB Storage", "Email Support"}, Active: true},
		{ID: 5, Name: "Pro Yearly", Description: "Pro plan billed yearly", Price: 299.99, Currency: "USD", Interval: "yearly", Features: []string{"Unlimited Projects", "100GB Storage", "Priority Support", "Advanced Analytics"}, Active: true},
	}

	// Generate sample subscriptions
	generateSampleSubscriptions()
	
	// Generate sample recruiters
	generateSampleRecruiters()
}

func generateSampleSubscriptions() {
	userNames := []string{"John Doe", "Jane Smith", "Bob Johnson", "Alice Brown", "Charlie Wilson", "Diana Davis", "Eve Miller", "Frank Garcia", "Grace Martinez", "Henry Rodriguez"}
	statuses := []string{"active", "trial", "cancelled", "expired"}

	for i := 1; i <= 100; i++ {
		plan := plans[rand.Intn(len(plans))]
		status := statuses[rand.Intn(len(statuses))]
		startDate := time.Now().AddDate(0, -rand.Intn(12), -rand.Intn(30))

		var endDate time.Time
		if plan.Interval == "monthly" {
			endDate = startDate.AddDate(0, 1, 0)
		} else {
			endDate = startDate.AddDate(1, 0, 0)
		}

		subscription := Subscription{
			ID:           i,
			UserID:       i,
			UserName:     userNames[rand.Intn(len(userNames))],
			UserEmail:    "user" + strconv.Itoa(i) + "@example.com",
			PlanID:       plan.ID,
			PlanName:     plan.Name,
			Status:       status,
			StartDate:    startDate,
			EndDate:      endDate,
			Amount:       plan.Price,
			Currency:     plan.Currency,
			BillingCycle: plan.Interval,
			CreatedAt:    startDate,
			UpdatedAt:    time.Now(),
		}
		subscriptions = append(subscriptions, subscription)
	}
}

func generateSampleRecruiters() {
	companies := []string{"TechCorp", "InnovateSoft", "DevSolutions", "CodeMasters", "CloudTech", "DataDrive", "WebWorks", "AppGenius", "SoftwarePro", "DigitalEdge"}
	positions := []string{"Backend Developer", "Frontend Developer", "Full Stack Developer", "Senior Engineer", "Lead Developer", "DevOps Engineer", "Software Architect"}
	techStacks := [][]string{
		{"JavaScript", "React", "Node.js"},
		{"Golang", "Docker", "Kubernetes"},
		{"JavaScript", "TypeScript", "Vue.js"},
		{"Golang", "PostgreSQL", "Redis"},
		{"JavaScript", "Angular", "Express"},
		{"Golang", "gRPC", "MongoDB"},
	}
	locations := []string{"Remote - USA", "Remote - Europe", "Remote - Global", "Remote - APAC", "New York, NY", "San Francisco, CA", "Austin, TX", "Seattle, WA"}
	statuses := []string{"active", "contacted", "interview", "rejected"}

	for i := 1; i <= 30; i++ {
		remote := i%3 != 0 // 2/3 of positions are remote
		techStack := techStacks[rand.Intn(len(techStacks))]
		
		recruiter := Recruiter{
			ID:          i,
			Name:        "Recruiter " + strconv.Itoa(i),
			Email:       "recruiter" + strconv.Itoa(i) + "@" + companies[rand.Intn(len(companies))] + ".com",
			Company:     companies[rand.Intn(len(companies))],
			Position:    positions[rand.Intn(len(positions))],
			TechStack:   techStack,
			Remote:      remote,
			Location:    locations[rand.Intn(len(locations))],
			Description: "Looking for talented developers to join our team. Great benefits and competitive salary.",
			ContactDate: time.Now().AddDate(0, 0, -rand.Intn(30)),
			Status:      statuses[rand.Intn(len(statuses))],
			CreatedAt:   time.Now().AddDate(0, 0, -rand.Intn(60)),
			UpdatedAt:   time.Now(),
		}
		recruiters = append(recruiters, recruiter)
	}
}

func main() {
	r := mux.NewRouter()

	// API routes
	r.HandleFunc("/api/subscriptions", getSubscriptions).Methods("GET")
	r.HandleFunc("/api/subscriptions/{id}", getSubscription).Methods("GET")
	r.HandleFunc("/api/subscriptions", createSubscription).Methods("POST")
	r.HandleFunc("/api/subscriptions/{id}", updateSubscription).Methods("PUT")
	r.HandleFunc("/api/subscriptions/{id}", deleteSubscription).Methods("DELETE")
	r.HandleFunc("/api/plans", getPlans).Methods("GET")
	r.HandleFunc("/api/analytics", getAnalytics).Methods("GET")
	
	// Recruiter routes
	r.HandleFunc("/api/recruiters", getRecruiters).Methods("GET")
	r.HandleFunc("/api/recruiters/{id}", getRecruiter).Methods("GET")
	r.HandleFunc("/api/recruiters", createRecruiter).Methods("POST")
	r.HandleFunc("/api/recruiters/{id}", updateRecruiter).Methods("PUT")
	r.HandleFunc("/api/recruiters/{id}", deleteRecruiter).Methods("DELETE")

	// WebSocket route
	r.HandleFunc("/ws", handleWebSocket)

	// CORS middleware
	c := cors.New(cors.Options{
		AllowedOrigins: []string{"*"},
		AllowedMethods: []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders: []string{"*"},
	})

	handler := c.Handler(r)

	// Start broadcasting data
	go handleMessages()
	go generateRealtimeData()

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	log.Printf("Subscription Management Server starting on :%s", port)
	log.Fatal(http.ListenAndServe(":"+port, handler))
}

func getSubscriptions(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	// Pagination
	page := 1
	limit := 10
	if p := r.URL.Query().Get("page"); p != "" {
		page, _ = strconv.Atoi(p)
	}
	if l := r.URL.Query().Get("limit"); l != "" {
		limit, _ = strconv.Atoi(l)
	}

	start := (page - 1) * limit
	end := start + limit
	if end > len(subscriptions) {
		end = len(subscriptions)
	}
	if start > len(subscriptions) {
		start = len(subscriptions)
	}

	result := subscriptions[start:end]
	json.NewEncoder(w).Encode(map[string]interface{}{
		"subscriptions": result,
		"total":         len(subscriptions),
		"page":          page,
		"limit":         limit,
	})
}

func getSubscription(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, _ := strconv.Atoi(vars["id"])

	for _, subscription := range subscriptions {
		if subscription.ID == id {
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(subscription)
			return
		}
	}

	http.Error(w, "Subscription not found", http.StatusNotFound)
}

func createSubscription(w http.ResponseWriter, r *http.Request) {
	var subscription Subscription
	if err := json.NewDecoder(r.Body).Decode(&subscription); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	subscription.ID = len(subscriptions) + 1
	subscription.CreatedAt = time.Now()
	subscription.UpdatedAt = time.Now()
	subscriptions = append(subscriptions, subscription)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(subscription)
}

func updateSubscription(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, _ := strconv.Atoi(vars["id"])

	for i, subscription := range subscriptions {
		if subscription.ID == id {
			var updatedSubscription Subscription
			if err := json.NewDecoder(r.Body).Decode(&updatedSubscription); err != nil {
				http.Error(w, err.Error(), http.StatusBadRequest)
				return
			}

			updatedSubscription.ID = id
			updatedSubscription.UpdatedAt = time.Now()
			subscriptions[i] = updatedSubscription

			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(updatedSubscription)
			return
		}
	}

	http.Error(w, "Subscription not found", http.StatusNotFound)
}

func deleteSubscription(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, _ := strconv.Atoi(vars["id"])

	for i, subscription := range subscriptions {
		if subscription.ID == id {
			subscriptions = append(subscriptions[:i], subscriptions[i+1:]...)
			w.WriteHeader(http.StatusNoContent)
			return
		}
	}

	http.Error(w, "Subscription not found", http.StatusNotFound)
}

func getPlans(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(plans)
}

func getAnalytics(w http.ResponseWriter, r *http.Request) {
	analytics := calculateAnalytics()
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(analytics)
}

func calculateAnalytics() Analytics {
	var analytics Analytics
	var monthlyRevenue, yearlyRevenue float64
	today := time.Now().Truncate(24 * time.Hour)

	for _, sub := range subscriptions {
		analytics.TotalSubscriptions++

		switch sub.Status {
		case "active":
			analytics.ActiveSubscriptions++
			if sub.BillingCycle == "monthly" {
				monthlyRevenue += sub.Amount
			} else {
				yearlyRevenue += sub.Amount
			}
		case "trial":
			analytics.TrialSubscriptions++
		case "cancelled":
			analytics.CancelledSubscriptions++
		}

		if sub.CreatedAt.Truncate(24 * time.Hour).Equal(today) {
			analytics.NewSubscriptionsToday++
		}

		if sub.Status == "cancelled" && sub.UpdatedAt.Truncate(24*time.Hour).Equal(today) {
			analytics.CancellationsToday++
		}
	}

	analytics.MonthlyRevenue = monthlyRevenue
	analytics.YearlyRevenue = yearlyRevenue

	if analytics.ActiveSubscriptions > 0 {
		analytics.AverageRevenuePerUser = (monthlyRevenue + yearlyRevenue/12) / float64(analytics.ActiveSubscriptions)
	}

	if analytics.TotalSubscriptions > 0 {
		analytics.ChurnRate = float64(analytics.CancelledSubscriptions) / float64(analytics.TotalSubscriptions) * 100
	}

	return analytics
}

func handleWebSocket(w http.ResponseWriter, r *http.Request) {
	ws, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Fatal(err)
	}
	defer ws.Close()

	clients[ws] = true
	log.Println("Client connected to subscription dashboard")

	for {
		_, _, err := ws.ReadMessage()
		if err != nil {
			log.Printf("error: %v", err)
			delete(clients, ws)
			break
		}
	}
}

func handleMessages() {
	for {
		data := <-broadcast
		messageBytes, _ := json.Marshal(data)

		for client := range clients {
			err := client.WriteMessage(websocket.TextMessage, messageBytes)
			if err != nil {
				log.Printf("error: %v", err)
				client.Close()
				delete(clients, client)
			}
		}
	}
}

func generateRealtimeData() {
	ticker := time.NewTicker(5 * time.Second)
	defer ticker.Stop()

	for range ticker.C {
		analytics := calculateAnalytics()

		// Get recent subscriptions (last 10)
		recentSubs := subscriptions
		if len(subscriptions) > 10 {
			recentSubs = subscriptions[len(subscriptions)-10:]
		}

		data := RealtimeData{
			Analytics:     analytics,
			Subscriptions: recentSubs,
			Timestamp:     time.Now().Format("15:04:05"),
		}

		broadcast <- data
	}
}

func getRecruiters(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	// Get query parameters for filtering
	remoteFilter := r.URL.Query().Get("remote")
	techStackFilter := r.URL.Query().Get("tech_stack")
	statusFilter := r.URL.Query().Get("status")

	// Filter recruiters based on query parameters
	filteredRecruiters := []Recruiter{}
	for _, recruiter := range recruiters {
		// Filter by remote
		if remoteFilter != "" {
			isRemote := remoteFilter == "true"
			if recruiter.Remote != isRemote {
				continue
			}
		}

		// Filter by tech stack
		if techStackFilter != "" {
			hasTech := false
			for _, tech := range recruiter.TechStack {
				if tech == techStackFilter {
					hasTech = true
					break
				}
			}
			if !hasTech {
				continue
			}
		}

		// Filter by status
		if statusFilter != "" && recruiter.Status != statusFilter {
			continue
		}

		filteredRecruiters = append(filteredRecruiters, recruiter)
	}

	// Pagination
	page := 1
	limit := 20
	if p := r.URL.Query().Get("page"); p != "" {
		page, _ = strconv.Atoi(p)
	}
	if l := r.URL.Query().Get("limit"); l != "" {
		limit, _ = strconv.Atoi(l)
	}

	start := (page - 1) * limit
	end := start + limit
	if end > len(filteredRecruiters) {
		end = len(filteredRecruiters)
	}
	if start > len(filteredRecruiters) {
		start = len(filteredRecruiters)
	}

	result := filteredRecruiters[start:end]
	json.NewEncoder(w).Encode(map[string]interface{}{
		"recruiters": result,
		"total":      len(filteredRecruiters),
		"page":       page,
		"limit":      limit,
	})
}

func getRecruiter(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, _ := strconv.Atoi(vars["id"])

	for _, recruiter := range recruiters {
		if recruiter.ID == id {
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(recruiter)
			return
		}
	}

	http.Error(w, "Recruiter not found", http.StatusNotFound)
}

func createRecruiter(w http.ResponseWriter, r *http.Request) {
	var recruiter Recruiter
	if err := json.NewDecoder(r.Body).Decode(&recruiter); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	recruiter.ID = len(recruiters) + 1
	recruiter.CreatedAt = time.Now()
	recruiter.UpdatedAt = time.Now()
	recruiters = append(recruiters, recruiter)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(recruiter)
}

func updateRecruiter(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, _ := strconv.Atoi(vars["id"])

	for i, recruiter := range recruiters {
		if recruiter.ID == id {
			var updatedRecruiter Recruiter
			if err := json.NewDecoder(r.Body).Decode(&updatedRecruiter); err != nil {
				http.Error(w, err.Error(), http.StatusBadRequest)
				return
			}

			updatedRecruiter.ID = id
			updatedRecruiter.UpdatedAt = time.Now()
			recruiters[i] = updatedRecruiter

			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(updatedRecruiter)
			return
		}
	}

	http.Error(w, "Recruiter not found", http.StatusNotFound)
}

func deleteRecruiter(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, _ := strconv.Atoi(vars["id"])

	for i, recruiter := range recruiters {
		if recruiter.ID == id {
			recruiters = append(recruiters[:i], recruiters[i+1:]...)
			w.WriteHeader(http.StatusNoContent)
			return
		}
	}

	http.Error(w, "Recruiter not found", http.StatusNotFound)
}
