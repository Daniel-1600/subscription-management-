import './dashboard.css';
import './index.css';
import './recruiters.css';

const API_BASE_URL = 'http://localhost:8080/api';

interface Recruiter {
  id: number;
  name: string;
  email: string;
  company: string;
  position: string;
  tech_stack: string[];
  remote: boolean;
  location: string;
  description: string;
  contact_date: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface RecruitersResponse {
  recruiters: Recruiter[];
  total: number;
  page: number;
  limit: number;
}

let currentEditId: number | null = null;

// Fetch recruiters with filters
async function fetchRecruiters(): Promise<void> {
  const loadingSpinner = document.getElementById('loadingSpinner');
  const recruitersGrid = document.getElementById('recruitersGrid');
  const noResults = document.getElementById('noResults');
  const resultsInfo = document.getElementById('totalResults');

  if (loadingSpinner) loadingSpinner.style.display = 'block';
  if (recruitersGrid) recruitersGrid.innerHTML = '';
  if (noResults) noResults.style.display = 'none';

  try {
    const techStack = (document.getElementById('techStackFilter') as HTMLSelectElement)?.value || '';
    const remote = (document.getElementById('remoteFilter') as HTMLSelectElement)?.value || '';
    const status = (document.getElementById('statusFilter') as HTMLSelectElement)?.value || '';

    const params = new URLSearchParams();
    if (techStack) params.append('tech_stack', techStack);
    if (remote) params.append('remote', remote);
    if (status) params.append('status', status);

    const response = await fetch(`${API_BASE_URL}/recruiters?${params.toString()}`);
    const data: RecruitersResponse = await response.json();

    if (loadingSpinner) loadingSpinner.style.display = 'none';

    if (resultsInfo) {
      resultsInfo.textContent = `Found ${data.total} recruiter${data.total !== 1 ? 's' : ''}`;
    }

    if (data.recruiters && data.recruiters.length > 0) {
      renderRecruiters(data.recruiters);
    } else {
      if (noResults) noResults.style.display = 'block';
    }
  } catch (error) {
    console.error('Error fetching recruiters:', error);
    if (loadingSpinner) loadingSpinner.style.display = 'none';
    if (resultsInfo) resultsInfo.textContent = 'Error loading recruiters';
  }
}

// Render recruiters as cards
function renderRecruiters(recruiters: Recruiter[]): void {
  const recruitersGrid = document.getElementById('recruitersGrid');
  if (!recruitersGrid) return;

  recruitersGrid.innerHTML = recruiters.map(recruiter => `
    <div class="recruiter-card" data-id="${recruiter.id}">
      <div class="recruiter-header">
        <div class="recruiter-info">
          <h3>${recruiter.name}</h3>
          <p class="company">${recruiter.company}</p>
        </div>
        <div class="recruiter-actions">
          <button class="icon-btn edit-btn" data-id="${recruiter.id}" title="Edit">
            <i class="fas fa-edit"></i>
          </button>
          <button class="icon-btn delete-btn" data-id="${recruiter.id}" title="Delete">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
      
      <div class="recruiter-body">
        <div class="recruiter-detail">
          <i class="fas fa-briefcase"></i>
          <span>${recruiter.position}</span>
        </div>
        <div class="recruiter-detail">
          <i class="fas fa-envelope"></i>
          <span>${recruiter.email}</span>
        </div>
        <div class="recruiter-detail">
          <i class="fas fa-map-marker-alt"></i>
          <span>${recruiter.location}</span>
          ${recruiter.remote ? '<span class="badge badge-success">Remote</span>' : ''}
        </div>
        <div class="recruiter-detail">
          <i class="fas fa-code"></i>
          <div class="tech-stack">
            ${recruiter.tech_stack.map(tech => `<span class="badge badge-tech">${tech}</span>`).join('')}
          </div>
        </div>
        ${recruiter.description ? `
          <div class="recruiter-description">
            <p>${recruiter.description}</p>
          </div>
        ` : ''}
      </div>
      
      <div class="recruiter-footer">
        <span class="status-badge status-${recruiter.status}">${recruiter.status}</span>
        <span class="contact-date">
          <i class="fas fa-calendar"></i>
          ${new Date(recruiter.contact_date).toLocaleDateString()}
        </span>
      </div>
    </div>
  `).join('');

  // Attach event listeners to edit and delete buttons
  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = (e.currentTarget as HTMLElement).getAttribute('data-id');
      if (id) editRecruiter(parseInt(id));
    });
  });

  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = (e.currentTarget as HTMLElement).getAttribute('data-id');
      if (id && confirm('Are you sure you want to delete this recruiter?')) {
        deleteRecruiter(parseInt(id));
      }
    });
  });
}

// Edit recruiter
async function editRecruiter(id: number): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/recruiters/${id}`);
    const recruiter: Recruiter = await response.json();

    currentEditId = id;
    (document.getElementById('modalTitle') as HTMLElement).textContent = 'Edit Recruiter';
    (document.getElementById('recruiterName') as HTMLInputElement).value = recruiter.name;
    (document.getElementById('recruiterEmail') as HTMLInputElement).value = recruiter.email;
    (document.getElementById('recruiterCompany') as HTMLInputElement).value = recruiter.company;
    (document.getElementById('recruiterPosition') as HTMLInputElement).value = recruiter.position;
    (document.getElementById('recruiterTechStack') as HTMLInputElement).value = recruiter.tech_stack.join(', ');
    (document.getElementById('recruiterLocation') as HTMLInputElement).value = recruiter.location;
    (document.getElementById('recruiterRemote') as HTMLSelectElement).value = recruiter.remote.toString();
    (document.getElementById('recruiterStatus') as HTMLSelectElement).value = recruiter.status;
    (document.getElementById('recruiterDescription') as HTMLTextAreaElement).value = recruiter.description;

    openModal();
  } catch (error) {
    console.error('Error fetching recruiter:', error);
    alert('Error loading recruiter data');
  }
}

// Delete recruiter
async function deleteRecruiter(id: number): Promise<void> {
  try {
    await fetch(`${API_BASE_URL}/recruiters/${id}`, {
      method: 'DELETE'
    });
    fetchRecruiters();
  } catch (error) {
    console.error('Error deleting recruiter:', error);
    alert('Error deleting recruiter');
  }
}

// Open modal
function openModal(): void {
  const modal = document.getElementById('recruiterModal');
  if (modal) modal.style.display = 'flex';
}

// Close modal
function closeModal(): void {
  const modal = document.getElementById('recruiterModal');
  if (modal) modal.style.display = 'none';
  currentEditId = null;
  (document.getElementById('recruiterForm') as HTMLFormElement).reset();
  (document.getElementById('modalTitle') as HTMLElement).textContent = 'Add Recruiter';
}

// Save recruiter
async function saveRecruiter(event: Event): Promise<void> {
  event.preventDefault();

  const name = (document.getElementById('recruiterName') as HTMLInputElement).value;
  const email = (document.getElementById('recruiterEmail') as HTMLInputElement).value;
  const company = (document.getElementById('recruiterCompany') as HTMLInputElement).value;
  const position = (document.getElementById('recruiterPosition') as HTMLInputElement).value;
  const techStackInput = (document.getElementById('recruiterTechStack') as HTMLInputElement).value;
  const location = (document.getElementById('recruiterLocation') as HTMLInputElement).value;
  const remote = (document.getElementById('recruiterRemote') as HTMLSelectElement).value === 'true';
  const status = (document.getElementById('recruiterStatus') as HTMLSelectElement).value;
  const description = (document.getElementById('recruiterDescription') as HTMLTextAreaElement).value;

  const tech_stack = techStackInput.split(',').map(tech => tech.trim()).filter(tech => tech);

  const recruiterData = {
    name,
    email,
    company,
    position,
    tech_stack,
    remote,
    location,
    status,
    description,
    contact_date: new Date().toISOString()
  };

  try {
    const url = currentEditId
      ? `${API_BASE_URL}/recruiters/${currentEditId}`
      : `${API_BASE_URL}/recruiters`;
    const method = currentEditId ? 'PUT' : 'POST';

    await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(recruiterData)
    });

    closeModal();
    fetchRecruiters();
  } catch (error) {
    console.error('Error saving recruiter:', error);
    alert('Error saving recruiter');
  }
}

// Initialize event listeners
function initializeEventListeners(): void {
  // Search button
  document.getElementById('searchBtn')?.addEventListener('click', fetchRecruiters);

  // Reset button
  document.getElementById('resetBtn')?.addEventListener('click', () => {
    (document.getElementById('techStackFilter') as HTMLSelectElement).value = '';
    (document.getElementById('remoteFilter') as HTMLSelectElement).value = 'true';
    (document.getElementById('statusFilter') as HTMLSelectElement).value = '';
    fetchRecruiters();
  });

  // Add recruiter button
  document.getElementById('addRecruiterBtn')?.addEventListener('click', () => {
    currentEditId = null;
    (document.getElementById('recruiterForm') as HTMLFormElement).reset();
    (document.getElementById('modalTitle') as HTMLElement).textContent = 'Add Recruiter';
    openModal();
  });

  // Close modal buttons
  document.getElementById('closeModalBtn')?.addEventListener('click', closeModal);
  document.getElementById('cancelBtn')?.addEventListener('click', closeModal);

  // Form submit
  document.getElementById('recruiterForm')?.addEventListener('submit', saveRecruiter);

  // Close modal when clicking outside
  document.getElementById('recruiterModal')?.addEventListener('click', (e) => {
    if ((e.target as HTMLElement).id === 'recruiterModal') {
      closeModal();
    }
  });
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
  initializeEventListeners();
  fetchRecruiters();
});
