import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Task, DashboardCard, PortfolioCard, ProductCategory, TaskDetail } from '../models/task.interface';

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  private mockTasks: Task[] = [
    {
      id: 'QR796075927',
      accountName: 'MUJI (Hong Kong) Co., Ltd',
      naicDescription: 'All Other Miscellaneous Store Retailers (except Tobacco stores)',
      lobProducts: 'Casualty General Liability - Primary',
      transactionType: 'New business',
      propensityToBind: 'Almost certain',
      status: 'Pending',
      targetActionDate: '21 Jul 25',
      pendingAction: 'To quote',
      premium: 1801,
      priority: true
    },
    {
      id: 'QR123124142',
      accountName: 'Knight-Swift Transportation',
      naicDescription: 'Transportation and Warehousing',
      lobProducts: 'Casualty',
      transactionType: 'New business',
      propensityToBind: 'Likely',
      status: 'Pending',
      targetActionDate: '21 Jul 25',
      pendingAction: 'Sanction check',
      premium: 1600
    },
    {
      id: 'QR123123432',
      accountName: 'The Walt Disney Company',
      naicDescription: 'Other services (except Public Administration)',
      lobProducts: 'PremierTech',
      transactionType: 'New business',
      propensityToBind: 'Unlikely',
      status: 'Quoted',
      targetActionDate: '21 Jul 25',
      pendingAction: 'To bind',
      premium: 2300
    },
    {
      id: 'QR790912312',
      accountName: 'Amazon Hong Kong',
      naicDescription: 'Miscellaneous Store Retailers',
      lobProducts: 'D&O',
      transactionType: 'New business',
      propensityToBind: 'Almost certain',
      status: 'Quoted',
      targetActionDate: '26 Jul 25',
      pendingAction: 'To bind',
      premium: 8700
    },
    {
      id: 'QR117023169',
      accountName: 'RPW Group Inc.',
      naicDescription: 'Business to Business Electronic Markets',
      lobProducts: 'Casualty Liability',
      transactionType: 'Endorsement',
      propensityToBind: 'Likely',
      status: 'Referred',
      targetActionDate: '28 Jul 25',
      pendingAction: 'To assess risk',
      premium: 7300
    },
    {
      id: 'QR151064821',
      accountName: 'Convene Global Holdings Co., Ltd',
      naicDescription: 'All Other Miscellaneous Store Retailers (except Tobacco stores)',
      lobProducts: 'Workers Compensation',
      transactionType: 'New business',
      propensityToBind: 'Remote',
      status: 'Referred',
      targetActionDate: '31 Jul 25',
      pendingAction: 'To assess risk',
      premium: 0
    },
    {
      id: 'QR796075927-2',
      accountName: 'East West Tea Company',
      naicDescription: 'Food Services and Drinking Places',
      lobProducts: 'Workers Compensation',
      transactionType: 'Renewal',
      propensityToBind: 'Almost certain',
      status: 'Quoted',
      targetActionDate: '31 Jul 25',
      pendingAction: 'To bind',
      premium: 700
    },
    {
      id: 'QR79097199',
      accountName: 'Staples',
      naicDescription: 'Educational Services',
      lobProducts: 'Workers Compensation',
      transactionType: 'Renewal',
      propensityToBind: 'Even chance',
      status: 'Pending',
      targetActionDate: '1 Aug 25',
      pendingAction: 'To quote',
      premium: 0
    }
  ];

  private dashboardCards: DashboardCard[] = [
    {
      id: '1',
      title: 'Open tasks / high priority',
      value: '23',
      subtitle: 'open / 5 priority',
      change: '+2 from yesterday',
      link: '/tasks',
      type: 'tasks',
      icon: '🖍'
    },
    {
      id: '2',
      title: 'Completed this week',
      value: '7',
      subtitle: '',
      change: '+2 from last week',
      link: '/completed-tasks',
      type: 'completed',
      icon: '📊'
    }
  ];

  private portfolioCards: PortfolioCard[] = [
    {
      id: '1',
      title: 'My portfolio (YTD)',
      value: '$2.4M',
      boundAmount: 'bound',
      boundQuoteRatio: '58% bound-quote ratio',
      openQuote: '$1M open quote',
      link: 'Visit Qliksense',
      icon: '💼'
    },
    {
      id: '2',
      title: 'Team portfolio (YTD)',
      value: '$8M',
      boundAmount: 'bound / $12M target',
      boundQuoteRatio: '54% bound-quote ratio',
      openQuote: '$12M open quote',
      link: 'Visit Qliksense',
      icon: '🏢'
    }
  ];

  private productCategories: ProductCategory[] = [
    {
      id: '1',
      name: 'Underwriting tools',
      icon: 'edit',
      isActive: false
    },
    {
      id: '2',
      name: "Today's tasks",
      icon: 'edit',
      isActive: true
    },
    {
      id: '3',
      name: 'Servicing',
      icon: 'settings',
      isActive: false
    },
    {
      id: '4',
      name: 'Collaboration',
      icon: 'users',
      isActive: false
    }
  ];

  private taskDetails: { [key: string]: TaskDetail } = {
    'QR796075927': {
      insured: 'MUJI (Hong Kong) Co., Ltd',
      policyholder: 'MUJI (Hong Kong) Co., Ltd',
      producer: '7008101-HOWDEN INSURANCE BROKERS(HK) LTD (CIGNA), 35/F, CITICORP CENTRE,, 18 WHITFUELD ROAD,, CAUSEWAY BAY, HONG KONG, HK',
      producerContact: 'Joanna Lee',
      naicsOccupancyCode: '453998A - Other High Street Store Retailers',
      sicCode: '5044 - Office Equipment',
      businessDescription: ''
    },
    // Add task details for completed tasks
    'QR796075925': {
      insured: 'Microsoft Corporation',
      policyholder: 'Microsoft Corporation',
      producer: '7008102-MARSH & MCLENNAN COMPANIES INC, 1166 AVENUE OF THE AMERICAS, NEW YORK, NY 10036',
      producerContact: 'Sarah Johnson',
      naicsOccupancyCode: '541511 - Software Publishers',
      sicCode: '7372 - Prepackaged Software',
      businessDescription: 'Technology and software development company'
    },
    'QR796075926': {
      insured: 'Tesla, Inc.',
      policyholder: 'Tesla, Inc.',
      producer: '7008103-WILLIS TOWERS WATSON, 200 LIBERTY STREET, NEW YORK, NY 10281',
      producerContact: 'Michael Chen',
      naicsOccupancyCode: '336111 - Automobile Manufacturing',
      sicCode: '3711 - Motor Vehicles and Passenger Car Bodies',
      businessDescription: 'Electric vehicle and clean energy company'
    },
    'QR796075928': {
      insured: 'Shopify Inc.',
      policyholder: 'Shopify Inc.',
      producer: '7008104-AON CORPORATION, 200 E RANDOLPH ST, CHICAGO, IL 60601',
      producerContact: 'Emily Rodriguez',
      naicsOccupancyCode: '518210 - Data Processing, Hosting, and Related Services',
      sicCode: '7374 - Computer Processing and Data Preparation',
      businessDescription: 'E-commerce platform and services provider'
    },
    'QR796075929': {
      insured: 'Zoom Video Communications',
      policyholder: 'Zoom Video Communications',
      producer: '7008105-GALLAGHER INSURANCE, 2 PIERCE PLACE, ITASCA, IL 60143',
      producerContact: 'David Wilson',
      naicsOccupancyCode: '541511 - Software Publishers',
      sicCode: '7372 - Prepackaged Software',
      businessDescription: 'Video communications and collaboration software'
    },
    'QR796075930': {
      insured: 'Airbnb, Inc.',
      policyholder: 'Airbnb, Inc.',
      producer: '7008106-BROWN & BROWN INC, 220 S RIDGEWOOD AVE, DAYTONA BEACH, FL 32114',
      producerContact: 'Lisa Thompson',
      naicsOccupancyCode: '561599 - All Other Travel Arrangement Services',
      sicCode: '7389 - Business Services, NEC',
      businessDescription: 'Online marketplace for short-term lodging and experiences'
    },
    'QR796075931': {
      insured: 'Slack Technologies',
      policyholder: 'Slack Technologies',
      producer: '7008107-USI INSURANCE SERVICES, 100 SUMMIT LAKE DR, VALHALLA, NY 10595',
      producerContact: 'Robert Garcia',
      naicsOccupancyCode: '541511 - Software Publishers',
      sicCode: '7372 - Prepackaged Software',
      businessDescription: 'Business communication and collaboration platform'
    },
    'QR796075932': {
      insured: 'DocuSign Inc.',
      policyholder: 'DocuSign Inc.',
      producer: '7008108-HUB INTERNATIONAL, 401 N MICHIGAN AVE, CHICAGO, IL 60611',
      producerContact: 'Jennifer Lee',
      naicsOccupancyCode: '541511 - Software Publishers',
      sicCode: '7372 - Prepackaged Software',
      businessDescription: 'Electronic signature and digital transaction management'
    }
  };

  getAllTasks(): Observable<Task[]> {
    return of(this.mockTasks);
  }

  getTaskById(id: string): Observable<Task | undefined> {
    const task = this.mockTasks.find(t => t.id === id);
    return of(task);
  }

  getTasksDueThisWeek(): Observable<Task[]> {
    return of(this.mockTasks.slice(0, 4));
  }

  getDashboardCards(): Observable<DashboardCard[]> {
    return of(this.dashboardCards);
  }

  getPortfolioCards(): Observable<PortfolioCard[]> {
    return of(this.portfolioCards);
  }

  getProductCategories(): Observable<ProductCategory[]> {
    return of(this.productCategories);
  }

  getTaskDetail(id: string): Observable<TaskDetail | undefined> {
    return of(this.taskDetails[id]);
  }

  getCompletedTasks(): Observable<Task[]> {
    // Return mock completed tasks - these would be tasks with status "Quoted" or "Bound"
    const completedTasks = [
      {
        id: 'QR796075925',
        accountName: 'Microsoft Corporation',
        naicDescription: 'Software Publishers',
        lobProducts: 'D&O Liability',
        transactionType: 'Renewal',
        propensityToBind: 'Almost certain',
        status: 'Bound',
        targetActionDate: '28 Jul 25',
        pendingAction: 'Completed',
        premium: 15000,
        priority: false
      },
      {
        id: 'QR796075926',
        accountName: 'Tesla, Inc.',
        naicDescription: 'Motor Vehicle Manufacturing',
        lobProducts: 'General Liability',
        transactionType: 'New business',
        propensityToBind: 'Likely',
        status: 'Bound',
        targetActionDate: '27 Jul 25',
        pendingAction: 'Completed',
        premium: 8500,
        priority: true
      },
      {
        id: 'QR796075928',
        accountName: 'Shopify Inc.',
        naicDescription: 'Data Processing, Hosting Services',
        lobProducts: 'Cyber Liability',
        transactionType: 'Endorsement',
        propensityToBind: 'Almost certain',
        status: 'Bound',
        targetActionDate: '26 Jul 25',
        pendingAction: 'Completed',
        premium: 12000,
        priority: false
      },
      {
        id: 'QR796075929',
        accountName: 'Zoom Video Communications',
        naicDescription: 'Software Publishers',
        lobProducts: 'Workers Compensation',
        transactionType: 'Renewal',
        propensityToBind: 'Likely',
        status: 'Bound',
        targetActionDate: '25 Jul 25',
        pendingAction: 'Completed',
        premium: 6800,
        priority: false
      },
      {
        id: 'QR796075930',
        accountName: 'Airbnb, Inc.',
        naicDescription: 'Other Services',
        lobProducts: 'General Liability',
        transactionType: 'New business',
        propensityToBind: 'Almost certain',
        status: 'Bound',
        targetActionDate: '24 Jul 25',
        pendingAction: 'Completed',
        premium: 22000,
        priority: true
      },
      {
        id: 'QR796075931',
        accountName: 'Slack Technologies',
        naicDescription: 'Software Publishers',
        lobProducts: 'E&O Liability',
        transactionType: 'Renewal',
        propensityToBind: 'Likely',
        status: 'Bound',
        targetActionDate: '23 Jul 25',
        pendingAction: 'Completed',
        premium: 9200,
        priority: false
      },
      {
        id: 'QR796075932',
        accountName: 'DocuSign Inc.',
        naicDescription: 'Software Publishers',
        lobProducts: 'Cyber Liability',
        transactionType: 'New business',
        propensityToBind: 'Almost certain',
        status: 'Bound',
        targetActionDate: '22 Jul 25',
        pendingAction: 'Completed',
        premium: 7500,
        priority: false
      }
    ];
    return of(completedTasks);
  }
}