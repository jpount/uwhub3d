export interface Task {
  id: string;
  accountName: string;
  naicDescription: string;
  lobProducts: string;
  transactionType: string;
  propensityToBind: string;
  status: string;
  targetActionDate: string;
  pendingAction: string;
  premium: number;
  priority?: boolean;
  assignedTo?: string;
}

export interface Comment {
  id: string;
  author: string;
  content: string;
  createdDate: Date;
}

export interface DashboardCard {
  id: string;
  title: string;
  value: string;
  subtitle: string;
  change?: string;
  link?: string;
  type: 'tasks' | 'portfolio' | 'completed';
  icon?: string;
}

export interface PortfolioCard {
  id: string;
  title: string;
  value: string;
  boundAmount: string;
  boundQuoteRatio: string;
  openQuote: string;
  link: string;
  icon?: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  icon: string;
  isActive?: boolean;
}

export interface TaskDetail {
  insured: string;
  policyholder: string;
  producer: string;
  producerContact: string;
  naicsOccupancyCode: string;
  sicCode: string;
  businessDescription: string;
}