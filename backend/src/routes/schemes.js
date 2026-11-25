import express from 'express';

const router = express.Router();

const schemes = [
  {
    id: 'kerala-crop-insurance',
    scope: 'kerala',
    scheme_name: 'Kerala State Crop Insurance Scheme',
    department: 'Kerala Department of Agriculture Development and Farmers Welfare',
    description: 'Kerala crop insurance services for notified crops and eligible cultivators.',
    eligibility: 'Coverage, crop, area, premium and enrolment dates depend on the current state notification.',
    benefits: 'Insurance compensation for eligible insured crop losses under the applicable terms.',
    application_url: 'https://aims.kerala.gov.in/'
  },
  {
    id: 'subhiksha-keralam',
    scope: 'kerala',
    scheme_name: 'Subhiksha Keralam',
    department: 'Government of Kerala',
    description: 'Kerala agriculture initiative supporting food production and cultivation activities.',
    eligibility: 'Programme activities and eligibility are set by the current government and local agriculture office.',
    benefits: 'Support varies by activity, locality and currently available programme.',
    application_url: 'https://aims.kerala.gov.in/'
  },
  {
    id: 'pm-kisan',
    scope: 'central',
    scheme_name: 'PM-KISAN',
    department: 'Department of Agriculture and Farmers Welfare, Government of India',
    description: 'Direct income support for eligible landholding farmer families.',
    eligibility: 'Subject to the current PM-KISAN rules, land records and exclusion criteria.',
    benefits: 'Income support in instalments as specified by the scheme.',
    application_url: 'https://pmkisan.gov.in/'
  },
  {
    id: 'pmfby',
    scope: 'central',
    scheme_name: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
    department: 'Ministry of Agriculture and Farmers Welfare, Government of India',
    description: 'Crop insurance for notified crops and areas when coverage is available for the season.',
    eligibility: 'Eligible farmers growing a notified crop in an insured area; enrolment windows and terms vary.',
    benefits: 'Insurance protection against specified crop losses under the current season notification.',
    application_url: 'https://pmfby.gov.in/'
  },
  {
    id: 'kisan-credit-card',
    scope: 'central',
    scheme_name: 'Kisan Credit Card (KCC)',
    department: 'Government of India and participating banks',
    description: 'Agricultural credit facility offered through participating banks for eligible farmers.',
    eligibility: 'Subject to bank assessment, eligible farming activity and current lending rules.',
    benefits: 'Access to a revolving agricultural credit limit on the applicable terms.',
    application_url: 'https://www.myscheme.gov.in/schemes/kcc'
  },
  {
    id: 'pmksy-micro-irrigation',
    scope: 'central',
    scheme_name: 'PMKSY – Per Drop More Crop',
    department: 'Department of Agriculture and Farmers Welfare, Government of India',
    description: 'Promotes improved on-farm water-use efficiency through micro-irrigation.',
    eligibility: 'Assistance and applications depend on state implementation, land and system requirements.',
    benefits: 'Potential support for eligible drip or sprinkler irrigation systems under current state guidelines.',
    application_url: 'https://pmksy.gov.in/'
  },
  {
    id: 'coconut-board-support',
    scope: 'central',
    scheme_name: 'Coconut Development Board programmes',
    department: 'Coconut Development Board, Government of India',
    description: 'Coconut-sector development, farmer resources and programme information.',
    eligibility: 'Programme-specific; participating farmer groups, growers and businesses should check current notices.',
    benefits: 'Benefits and support depend on the active Coconut Development Board programme.',
    application_url: 'https://coconutboard.gov.in/'
  },
  {
    id: 'pm-kusum',
    scope: 'central',
    scheme_name: 'PM-KUSUM',
    department: 'Ministry of New and Renewable Energy, Government of India',
    description: 'Supports eligible solar energy installations for agricultural use under current programme components.',
    eligibility: 'Component, state allocation, applicant category and application window determine eligibility.',
    benefits: 'Support for eligible solar pumps and decentralised renewable energy projects under active guidelines.',
    application_url: 'https://pmkusum.mnre.gov.in/'
  },
  {
    id: 'soil-health-card',
    scope: 'central',
    scheme_name: 'Soil Health Card',
    department: 'Department of Agriculture and Farmers Welfare, Government of India',
    description: 'Soil testing and nutrient recommendations to support balanced fertiliser use.',
    eligibility: 'Farmers can contact their local agriculture office or soil testing laboratory for availability.',
    benefits: 'Soil nutrient status and crop-specific nutrient recommendations based on the test.',
    application_url: 'https://soilhealth.dac.gov.in/'
  },
  {
    id: 'agriculture-infrastructure-fund',
    scope: 'central',
    scheme_name: 'Agriculture Infrastructure Fund',
    department: 'Department of Agriculture and Farmers Welfare, Government of India',
    description: 'Financing support for eligible post-harvest management infrastructure and community farming assets.',
    eligibility: 'Eligible beneficiaries and projects are defined by current scheme guidelines and lender assessment.',
    benefits: 'Financing facilitation for qualifying projects under current programme terms.',
    application_url: 'https://agriinfra.dac.gov.in/'
  },
  {
    id: 'pm-kisan-maandhan',
    scope: 'central',
    scheme_name: 'PM-Kisan Maandhan Yojana',
    department: 'Ministry of Agriculture and Farmers Welfare, Government of India',
    description: 'Voluntary contributory pension programme for eligible small and marginal farmers.',
    eligibility: 'Age, landholding and exclusion criteria apply; check the current official requirements.',
    benefits: 'Pension benefit as specified by programme rules after meeting contribution requirements.',
    application_url: 'https://maandhan.in/'
  }
];

router.get('/', (_req, res) => {
  res.json(schemes);
});

export default router;
