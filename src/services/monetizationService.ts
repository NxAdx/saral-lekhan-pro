import { Platform } from 'react-native';
import Purchases, { CustomerInfo } from 'react-native-purchases';
import { useSettingsStore } from '../store/settingsStore';
import { log } from '../utils/Logger';

const API_KEYS = {
  apple: 'goog_placeholder_ios_key',
  google: 'goog_placeholder_android_key',
};

const ENTITLEMENT_ID = 'pro';

export class MonetizationService {
  private static isInitialized = false;

  static async initialize() {
    if (this.isInitialized) return;

    try {
      if (Platform.OS === 'android') {
        await Purchases.configure({ apiKey: API_KEYS.google });
      } else {
        await Purchases.configure({ apiKey: API_KEYS.apple });
      }

      this.isInitialized = true;
      log.info('RevenueCat initialized successfully');

      // Set up listener for customer info updates
      Purchases.addCustomerInfoUpdateListener((info) => {
        this.updateProStatus(info);
      });

      // Initial check
      const customerInfo = await Purchases.getCustomerInfo();
      this.updateProStatus(customerInfo);
    } catch (e) {
      log.error('Failed to initialize RevenueCat', e);
    }
  }

  static updateProStatus(info: CustomerInfo) {
    const isPro = !!info.entitlements.active[ENTITLEMENT_ID];
    useSettingsStore.getState().setIsPro(isPro);
    log.info(`Pro status updated: ${isPro}`);
  }

  static async getOfferings() {
    try {
      const offerings = await Purchases.getOfferings();
      if (offerings.current !== null) {
        return offerings.current.availablePackages;
      }
    } catch (e) {
      log.error('Failed to fetch offerings', e);
    }
    return [];
  }

  static async purchasePackage(pkg: any) {
    try {
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      this.updateProStatus(customerInfo);
      return true;
    } catch (e: any) {
      if (!e.userCancelled) {
        log.error('Purchase failed', e);
      }
      return false;
    }
  }

  static async restorePurchases() {
    try {
      const customerInfo = await Purchases.restorePurchases();
      this.updateProStatus(customerInfo);
      return true;
    } catch (e) {
      log.error('Restore failed', e);
      return false;
    }
  }
}
