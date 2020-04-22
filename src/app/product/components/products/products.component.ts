import {Component, OnDestroy, OnInit} from '@angular/core';
import {ProductService} from '../../services/product.service';
import {Observable, Subscription} from 'rxjs';
import {DataTableResource} from 'angular5-data-table';
import {Product} from 'shared/models/product';
import {NavService} from 'shared/services/nav.service';
import {AuthService} from 'shared/services/auth.service';
import {User} from 'shared/models/user';
import {AppUser} from 'shared/models/app-user';
import {LinkService} from 'shared/services/link.service';

@Component({
  selector: 'products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})
export class ProductsComponent implements OnInit, OnDestroy {
  isHandset$: Observable<boolean>;
  config = {
    itemsPerPage: 7,
    currentPage: 1
  };
  appUser$ = this.mockUser();
  tableResouce: DataTableResource<Product>;

  products: Product[] = [];
  initializedItems: Product[] = [];
  filteredItems: Product[] = [];

  private productsSubscription: Subscription;
  private userAuthSubscription: Subscription = new Subscription();
  private itemCount: number;
  private isSearching: boolean;

  constructor(private _navService: NavService,
              private _productService: ProductService,
              private _auth: AuthService,
              private _linkService: LinkService) {}

  async ngOnInit() {
    this.productsSubscription = this._productService.getAll()
      .subscribe(products => {
        this.products = products;
        this.initializeTable(products);
      });
    this.isHandset$ = this._navService.isHandset$;

    this.userAuthSubscription = this._auth.appUser$$
      .subscribe(appUser => this.appUser$ = appUser);
  }

  ngOnDestroy() {
    this.productsSubscription.unsubscribe();
    this._productService.loading = true;
  }

  filter(query: string) {
    const filteredProducts = (query) ?
      this.products.filter(p => p.name.toLowerCase().includes(query.toLowerCase())) :
      this.products;
    this.isSearching = (query) ? true : false;
    this.filteredItems = filteredProducts;
    this.initializeTable(filteredProducts);
  }

  pageChanged($event) {
    if (this.isSearching)
      this.pageChangedWhileTyping($event);
    else
      this.pageChangedNormally($event);
  }

  toUpperCase(name: string) {
    return name.charAt(0).toUpperCase() + name.substring(1);
  }


  get fileredProductsCount(): number {
    return this.itemCount;
  }

  get productsTitle() {
    return 'Lista produktów';
  }

  get productsLoading() {
    return this._productService.loading;
  }

  get description() {
    return '<p><b>Pyry</b>, trzeba jeść pyry, pyrki i ziemniaki żeby ' +
      'być dużym i silnym polakiem! Wspierajmy Polskę jedząc pyry!.</p>';
  }

  productLink(product: Product): string {
    return this._linkService.cutLink(product.name);
  }

  private remove(product: Product) {
    this._productService.remove(product.key);
  }

  private initializeTable(products: Product[]) {
    this.tableResouce = new DataTableResource<Product>(products);
    this.tableResouce.query({offset: 0, limit: this.config.itemsPerPage})
      .then(items => this.initializedItems = items);
    this.tableResouce.count()
      .then(count => this.itemCount = count);

    setTimeout(_ => {
      this._productService.loading = false;
    }, 1000);
  }


  private pageChangedWhileTyping($event): void {
    const startItem = ($event.page - 1) * $event.itemsPerPage;
    const endItem = $event.page * $event.itemsPerPage;
    this.initializedItems = this.filteredItems.slice(startItem, endItem);
  }

  private pageChangedNormally($event): void {
    const startItem = ($event.page - 1) * $event.itemsPerPage;
    const endItem = $event.page * $event.itemsPerPage;
    this.initializedItems = this.products.slice(startItem, endItem);
  }
  private mockUser(): AppUser {
    return new User(null, null, null).mockStats();
  }

}
