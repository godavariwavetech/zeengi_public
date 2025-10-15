import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then(m => m.HomePageModule)
  },
  {
    path: 'login',
    loadChildren: () => import('./login/login.module').then(m => m.LoginPageModule)
  },
  {
    path: 'slides',
    loadChildren: () => import('./slides/slides.module').then(m => m.SlidesPageModule)
  },
  {
    path: 'signup',
    loadChildren: () => import('./signup/signup.module').then(m => m.SignupPageModule)
  },
  {
    path: 'profile',
    loadChildren: () => import('./profile/profile.module').then(m => m.ProfilePageModule)
  },
  {
    path: 'categories',
    loadChildren: () => import('./categories/categories.module').then(m => m.CategoriesPageModule)
  },
  {
    path: 'main-resturant',
    loadChildren: () => import('./main-resturant/main-resturant.module').then(m => m.MainResturantPageModule)
  },
  {
    path: 'location',
    loadChildren: () => import('./location/location.module').then(m => m.LocationPageModule)
  },
  {
    path: 'groceries',
    loadChildren: () => import('./groceries/groceries.module').then(m => m.GroceriesPageModule)
  },
  {
    path: 'groceries-product',
    loadChildren: () => import('./groceries-product/groceries-product.module').then(m => m.GroceriesProductPageModule)
  },
  {
    path: 'subscribe',
    loadChildren: () => import('./subscribe/subscribe.module').then(m => m.SubscribePageModule)
  },
  {
    path: 'basket',
    loadChildren: () => import('./basket/basket.module').then(m => m.BasketPageModule)
  },
  {
    path: 'delivery-map',
    loadChildren: () => import('./delivery-map/delivery-map.module').then(m => m.DeliveryMapPageModule)
  },
  {
    path: 'wallet',
    loadChildren: () => import('./wallet/wallet.module').then(m => m.WalletPageModule)
  },
  {
    path: 'comingsoon',
    loadChildren: () => import('./comingsoon/comingsoon.module').then(m => m.ComingsoonPageModule)
  },
  {
    path: 'servicelocation',
    loadChildren: () => import('./servicelocation/servicelocation.module').then(m => m.ServicelocationPageModule)
  },
  {
    path: 'notification',
    loadChildren: () => import('./notification/notification.module').then( m => m.NotificationPageModule)
  },
  {
    path: 'orders',
    loadChildren: () => import('./orders/orders.module').then(m => m.OrdersPageModule)
  },
  {
    path: 'ordertracking',
    loadChildren: () => import('./ordertracking/ordertracking.module').then(m => m.OrdertrackingPageModule)
  },
  {
    path: 'sub-subscribe',
    loadChildren: () => import('./sub-subscribe/sub-subscribe.module').then(m => m.SubSubscribePageModule)
  },
  {
    path: 'more',
    loadChildren: () => import('./more/more.module').then(m => m.MorePageModule)
  },
  {
    path: 'news',
    loadChildren: () => import('./news/news.module').then(m => m.NewsPageModule)
  },
  {
    path: 'terms',
    loadChildren: () => import('./terms/terms.module').then(m => m.TermsPageModule)
  },
  {
    path: 'support',
    loadChildren: () => import('./support/support.module').then(m => m.SupportPageModule)
  },
  {
    path: 'search',
    loadChildren: () => import('./search/search.module').then(m => m.SearchPageModule)
  },
  {
    path: 'map-location',
    loadChildren: () => import('./delivery-location/delivery-location.module').then(m => m.DeliveryLocationPageModule)
  },
  {
    path: 'default-address',
    loadChildren: () => import('./default-address/default-address.module').then( m => m.DefaultAddressPageModule)
  },
  {
    path: 'update',
    loadChildren: () => import('./update/update.module').then( m => m.UpdatePageModule)
  },
  {
    path: 'about',
    loadChildren: () => import('./about/about.module').then( m => m.AboutPageModule)
  },
  {
    path: 'app-review',
    loadChildren: () => import('./app-review/app-review.module').then( m => m.AppReviewPageModule)
  },
  {
    path: 'privacy',
    loadChildren: () => import('./privacy/privacy.module').then( m => m.PrivacyPageModule)
  },
  {
    path: 'refund',
    loadChildren: () => import('./refund/refund.module').then( m => m.RefundPageModule)
  },
  {
    path: 'settings',
    loadChildren: () => import('./settings/settings.module').then( m => m.SettingsPageModule)
  },
  {
    path: 'about-policy',
    loadChildren: () => import('./about-policy/about-policy.module').then( m => m.AboutPolicyPageModule)
  },
  {
    path: 'menu',
    loadChildren: () => import('./menu/menu.module').then( m => m.MenuPageModule)
  },
  {
    path: 'collection',
    loadChildren: () => import('./collection/collection.module').then( m => m.CollectionPageModule)
  },
  {
    path: 'shop-ratings',
    loadChildren: () => import('./shop-ratings/shop-ratings.module').then( m => m.ShopRatingsPageModule)
  },
  {
    path: 'schedule',
    loadChildren: () => import('./schedule/schedule.module').then( m => m.SchedulePageModule)
  },
  {
    path: 'vegmode-modal',
    loadChildren: () => import('./vegmode-modal/vegmode-modal.module').then( m => m.VegmodeModalPageModule)
  },
  {
    path: 'network-off',
    loadChildren: () => import('./network-off/network-off.module').then( m => m.NetworkOffPageModule)
  },
  {
    path: 'allow-location',
    loadChildren: () => import('./allow-location/allow-location.module').then( m => m.AllowLocationPageModule)
  },
  










];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
