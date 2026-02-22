import { merchantService } from "../services/merchant.service";
import type {
  RegisterRequest,
  ProfileRequest,
  DocumentsRequest,
  BankAccountRequest,
  MenuItemRequest,
  SubmitOnboardingRequest,
  OperationHourItem,
} from "../types/merchant";

export interface RegistrationData {
  // Step 1
  full_name: string;
  email: string;
  phone_number: string;
  work_area_id: string;
  merchant_uuid: string;

  // Step 2
  merchant_name: string;
  store_name: string;
  category_id: number | null;
  address: string;
  latitude: number | null;
  longitude: number | null;
  contact_phone: string;
  operation_hours: OperationHourItem[];

  // Step 3
  id_card_number: string;
  id_card_image: string;
  selfie_image: string;
  store_front_image: string;
  store_inside_image: string;

  // Step 4
  bank_code: string;
  account_number: string;
  account_holder_name: string;

  // Step 5
  menu_items: MenuItemRequest[];

  // Step 6
  declaration_agreement: boolean;
  submit_date: string;
  
  // Additional field for status
  status?: string;
}

// Interface for merchant profile from API
export interface MerchantProfileData {
  uuid: string;
  store_name: string;
  category_id: number;
  address: string;
  latitude: number | null;
  longitude: number | null;
  work_area_id?: string;
  contact_phone: string;
  operation_hours?: OperationHourItem[];
  id_card_number?: string;
  id_card_image_url?: string;
  selfie_image_url?: string;
  store_front_image_url?: string;
  store_inside_image_url?: string;
  bank_code?: string;
  account_number?: string;
  account_holder_name?: string;
  status?: string;
}

function createDefaultRegistrationData(): RegistrationData {
  return {
    full_name: "",
    email: "",
    phone_number: "",
    work_area_id: "",
    merchant_uuid: "",

    merchant_name: "",
    store_name: "",
    category_id: null,
    address: "",
    latitude: null,
    longitude: null,
    contact_phone: "",
    operation_hours: [],

    id_card_number: "",
    id_card_image: "",
    selfie_image: "",
    store_front_image: "",
    store_inside_image: "",

    bank_code: "",
    account_number: "",
    account_holder_name: "",

    menu_items: [],

    declaration_agreement: false,
    submit_date: new Date().toISOString().split("T")[0],
  };
}

export function createMerchantRegistrationStore() {
  let currentStep = $state(1);
  let isLoading = $state(false);
  let error = $state<string | null>(null);
  let isSubmitted = $state(false);
  let data = $state<RegistrationData>(createDefaultRegistrationData());
  
  // State for dialogs
  let showPendingDialog = $state(false);
  let showSubmittedDialog = $state(false);

  function reset() {
    currentStep = 1;
    isLoading = false;
    error = null;
    isSubmitted = false;
    data = createDefaultRegistrationData();
    showPendingDialog = false;
    showSubmittedDialog = false;
  }

  function nextStep() {
    if (currentStep < 6) {
      currentStep++;
    }
  }

  function prevStep() {
    if (currentStep > 1) {
      currentStep--;
    }
  }

  function goToStep(step: number) {
    if (step >= 1 && step <= 6) {
      currentStep = step;
    }
  }

  // Check for waiting merchant profile on page load
  async function checkWaitingProfile() {
    isLoading = true;
    error = null;
    try {
      const response = await merchantService.getWaitingMerchantProfile();
      const profile = response.data;
      
      if (profile?.uuid) {
        // Populate ALL data from profile
        data.merchant_uuid = profile.uuid;
        data.store_name = profile.store_name || "";
        data.merchant_name = profile.store_name || "";
        data.category_id = profile.category_id;
        data.address = profile.address || "";
        data.latitude = profile.latitude;
        data.longitude = profile.longitude;
        data.work_area_id = profile.work_area_id || "";
        data.contact_phone = profile.contact_phone || "";
        data.id_card_number = profile.id_card_number || "";
        data.id_card_image = profile.id_card_image_url || "";
        data.selfie_image = profile.selfie_image_url || "";
        data.store_front_image = profile.store_front_image_url || "";
        data.store_inside_image = profile.store_inside_image_url || "";
        data.bank_code = profile.bank_code || "";
        data.account_number = profile.account_number || "";
        data.account_holder_name = profile.account_holder_name || "";
        data.status = profile.status;
        
        const status = profile.status;
        
        // Determine current step based on status
        if (status === 'step1') {
          currentStep = 2;
        } else if (status === 'step2') {
          currentStep = 3;
        } else if (status === 'step3') {
          currentStep = 4;
        } else if (status === 'step4') {
          currentStep = 5;
        } else if (status === 'step5') {
          currentStep = 6;
        } else if (status === 'submitted') {
          showSubmittedDialog = true;
          console.log('[Check Waiting] Submitted - showing dialog');
          return response;
        } else if (status === 'approved') {
          showPendingDialog = true;
          console.log('[Check Waiting] Approved - showing dialog');
          return response;
        } else if (status === 'rejected') {
          showPendingDialog = true;
          console.log('[Check Waiting] Rejected - showing dialog');
          return response;
        }
        
        // For step1-step5, show pending dialog to continue
        showPendingDialog = true;
        console.log('[Check Waiting] Found pending registration at', status, '- showing dialog, next step:', currentStep);
        return response;
      }
      return null;
    } catch (err: any) {
      console.log('[Check Waiting] No waiting profile found');
      throw err;
    } finally {
      isLoading = false;
    }
  }

  // Load data for specific step (when navigating between steps)
  async function loadStepData(targetStep: number) {
    isLoading = true;
    error = null;
    try {
      const response = await merchantService.getWaitingMerchantProfile();
      const profile = response.data;
      
      if (profile?.uuid) {
        // Populate ALL data from profile
        data.merchant_uuid = profile.uuid;
        data.store_name = profile.store_name || "";
        data.merchant_name = profile.store_name || "";
        data.category_id = profile.category_id;
        data.address = profile.address || "";
        data.latitude = profile.latitude;
        data.longitude = profile.longitude;
        data.work_area_id = profile.work_area_id || "";
        data.contact_phone = profile.contact_phone || "";
        data.id_card_number = profile.id_card_number || "";
        data.id_card_image = profile.id_card_image_url || "";
        data.selfie_image = profile.selfie_image_url || "";
        data.store_front_image = profile.store_front_image_url || "";
        data.store_inside_image = profile.store_inside_image_url || "";
        data.bank_code = profile.bank_code || "";
        data.account_number = profile.account_number || "";
        data.account_holder_name = profile.account_holder_name || "";
        data.status = profile.status;
        
        console.log('[Load Step Data] Loaded data for step:', targetStep);
        return response;
      }
      return null;
    } catch (err: any) {
      console.log('[Load Step Data] No data found');
      throw err;
    } finally {
      isLoading = false;
    }
  }

  // Step 1: Register
  async function submitStep1(formData: {
    full_name: string;
    email: string;
    phone_number: string;
    work_area_id: string;
  }) {
    isLoading = true;
    error = null;
    try {
      const response = await merchantService.register({
        full_name: formData.full_name,
        email: formData.email,
        phone_number: formData.phone_number,
        work_area_id: formData.work_area_id,
      });
      data.full_name = formData.full_name;
      data.email = formData.email;
      data.phone_number = formData.phone_number;
      data.work_area_id = formData.work_area_id;

      const merchantUuid = response.data?.uuid;
      if (merchantUuid) {
        data.merchant_uuid = merchantUuid;
        console.log('[Step 1] merchant_uuid saved:', merchantUuid);
      } else {
        console.error('[Step 1] merchant_uuid not found in response:', response);
        throw new Error('merchant_uuid tidak ditemukan dalam response API');
      }

      // Redirect to step 2
      import('$app/navigation').then(({ goto }) => {
        goto('/merchant/create/step-2');
      });
      
      return response;
    } catch (err: any) {
      error = err.response?.data?.message || err.message || "Registration failed";
      throw err;
    } finally {
      isLoading = false;
    }
  }

  // Continue with pending registration (called after user confirms in dialog)
  async function continueWithPendingRegistration() {
    // Step is already set in checkWaitingProfile, just close dialog
    showPendingDialog = false;
    console.log('[Continue Pending] Continuing to step:', currentStep);
  }

  function cancelPendingRegistration() {
    showPendingDialog = false;
  }

  function closeSubmittedDialog() {
    showSubmittedDialog = false;
    pendingFormData = null;
  }

  // Step 2: Profile
  async function submitStep2(formData: {
    merchant_name: string;
    category_id: number;
    address: string;
    latitude: number | null;
    longitude: number | null;
    contact_phone: string;
    operation_hours: OperationHourItem[];
  }) {
    isLoading = true;
    error = null;
    try {
      // Ensure coordinates are numbers (default to 0 if null)
      const lat = (formData.latitude !== null && formData.latitude !== undefined) ? parseFloat(String(formData.latitude)) : 0;
      const lng = (formData.longitude !== null && formData.longitude !== undefined) ? parseFloat(String(formData.longitude)) : 0;
      
      console.log('[Step2 Store] Submitting profile with coordinates:', lat, lng);
      
      const response = await merchantService.updateProfile({
        merchant_uuid: data.merchant_uuid,
        merchant_name: formData.merchant_name,
        category_id: formData.category_id,
        address: formData.address,
        coordinate: {
          latitude: lat,
          longitude: lng,
        },
        contact_phone: formData.contact_phone,
        operation_hours: formData.operation_hours,
      });
      data.merchant_name = formData.merchant_name;
      data.category_id = formData.category_id;
      data.address = formData.address;
      data.latitude = lat;
      data.longitude = lng;
      data.contact_phone = formData.contact_phone;
      data.operation_hours = formData.operation_hours;
      
      // Redirect to step 3
      import('$app/navigation').then(({ goto }) => {
        goto('/merchant/create/step-3');
      });
      
      return response;
    } catch (err: any) {
      error = err.response?.data?.message || "Profile update failed";
      throw err;
    } finally {
      isLoading = false;
    }
  }

  // Step 3: Documents
  async function submitStep3(formData: {
    id_card_number: string;
    id_card_image: string;
    selfie_image: string;
    store_front_image: string;
    store_inside_image: string;
  }) {
    isLoading = true;
    error = null;
    try {
      const response = await merchantService.updateDocuments({
        merchant_uuid: data.merchant_uuid,
        id_card_number: formData.id_card_number,
        id_card_image: formData.id_card_image,
        selfie_image: formData.selfie_image,
        store_front_image: formData.store_front_image,
        store_inside_image: formData.store_inside_image,
      });
      data.id_card_number = formData.id_card_number;
      data.id_card_image = formData.id_card_image;
      data.selfie_image = formData.selfie_image;
      data.store_front_image = formData.store_front_image;
      data.store_inside_image = formData.store_inside_image;
      
      // Redirect to step 4
      import('$app/navigation').then(({ goto }) => {
        goto('/merchant/create/step-4');
      });
      
      return response;
    } catch (err: any) {
      error = err.response?.data?.message || "Documents update failed";
      throw err;
    } finally {
      isLoading = false;
    }
  }

  // Step 4: Bank Account
  async function submitStep4(formData: {
    bank_code: string;
    account_number: string;
    account_holder_name: string;
  }) {
    isLoading = true;
    error = null;
    try {
      const response = await merchantService.updateBankAccount({
        merchant_uuid: data.merchant_uuid,
        bank_code: formData.bank_code,
        account_number: formData.account_number,
        account_holder_name: formData.account_holder_name,
      });
      data.bank_code = formData.bank_code;
      data.account_number = formData.account_number;
      data.account_holder_name = formData.account_holder_name;
      
      // Redirect to step 5
      import('$app/navigation').then(({ goto }) => {
        goto('/merchant/create/step-5');
      });
      
      return response;
    } catch (err: any) {
      error = err.response?.data?.message || "Bank account update failed";
      throw err;
    } finally {
      isLoading = false;
    }
  }

  // Step 5: Menu Items
  async function submitStep5(menuItems: {
    name: string;
    description: string;
    price: number;
    category: string;
    is_available: boolean;
    image_url: string;
  }[]) {
    isLoading = true;
    error = null;
    try {
      for (const item of menuItems) {
        await merchantService.addMenuItem({
          name: item.name,
          description: item.description,
          price: item.price,
          category: item.category,
          is_available: item.is_available,
          image_url: item.image_url,
          merchant_uuid: data.merchant_uuid,
        });
      }
      data.menu_items = menuItems as MenuItemRequest[];
      
      // Redirect to step 6
      import('$app/navigation').then(({ goto }) => {
        goto('/merchant/create/step-6');
      });
    } catch (err: any) {
      error = err.response?.data?.message || "Menu items update failed";
      throw err;
    } finally {
      isLoading = false;
    }
  }

  // Step 6: Submit Onboarding
  async function submitStep6(declarationAgreement: boolean) {
    isLoading = true;
    error = null;
    try {
      const response = await merchantService.submitOnboarding({
        merchant_uuid: data.merchant_uuid,
        declaration_agreement: declarationAgreement,
        submit_date: new Date().toISOString().split("T")[0],
      });
      data.declaration_agreement = declarationAgreement;
      isSubmitted = true;
      return response;
    } catch (err: any) {
      error = err.response?.data?.message || "Submission failed";
      throw err;
    } finally {
      isLoading = false;
    }
  }

  return {
    get currentStep() {
      return currentStep;
    },
    get isLoading() {
      return isLoading;
    },
    get error() {
      return error;
    },
    get isSubmitted() {
      return isSubmitted;
    },
    get data() {
      return data;
    },
    get showPendingDialog() {
      return showPendingDialog;
    },
    get showSubmittedDialog() {
      return showSubmittedDialog;
    },
    reset,
    nextStep,
    prevStep,
    goToStep,
    checkWaitingProfile,
    loadStepData,
    continueWithPendingRegistration,
    cancelPendingRegistration,
    closeSubmittedDialog,
    submitStep1,
    submitStep2,
    submitStep3,
    submitStep4,
    submitStep5,
    submitStep6,
  };
}

export const merchantRegistrationStore = createMerchantRegistrationStore();
