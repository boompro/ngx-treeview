import { Component, OnInit, ViewChild, HostListener } from '@angular/core';
import { TreeviewItem, TreeviewConfig, TreeviewComponent } from '../../lib';
import { BookService } from './book.service';

export enum KEY_CODE {
  RIGHT_ARROW = 39,
  LEFT_ARROW = 37,
  UP_ARROW = 38,
  DOWN_ARROW = 40,
  A = 65,
  D = 68,
  W = 87,
  S = 83,
  TAB = 9,
  ENTER = 13,
  SPACE = 32,
  ESC = 27,
}
@Component({
  selector: 'ngx-book',
  templateUrl: './book.component.html',
  providers: [
    BookService
  ]
})
export class BookComponent implements OnInit {
  @ViewChild('treeview') treeView: TreeviewComponent;
  dropdownEnabled = true;
  items: TreeviewItem[];
  values: number[];
  config = TreeviewConfig.create({
    hasAdd: true,
    hasAllCheckBox: true,
    hasFilter: true,
    hasCollapseExpand: true,
    decoupleChildFromParent: false,
    maxHeight: 400
  });

  buttonClasses = [
    'btn-outline-primary',
    'btn-outline-secondary',
    'btn-outline-success',
    'btn-outline-danger',
    'btn-outline-warning',
    'btn-outline-info',
    'btn-outline-light',
    'btn-outline-dark'
  ];
  buttonClass = this.buttonClasses[0];

  constructor(
    private service: BookService
  ) { }

  ngOnInit() {
    this.items = this.service.getBooks();
  }

  @HostListener('window:keydown', ['$event'])
  keyEvent(event: KeyboardEvent) {

    switch (event.keyCode) {
      case KEY_CODE.UP_ARROW: {
        this.treeView.onKeyUp();
        break;
      }
      case KEY_CODE.W: {
        this.treeView.onKeyUp();
        break;
      }
      case KEY_CODE.DOWN_ARROW: {
        this.treeView.onKeyDn();
        break;
      }
      case KEY_CODE.S: {
        this.treeView.onKeyDn();
        break;
      }
      case KEY_CODE.LEFT_ARROW: {
        this.treeView.onKeyLeft();
        break;
      }
      case KEY_CODE.A: {
        this.treeView.onKeyLeft();
        break;
      }
      case KEY_CODE.RIGHT_ARROW: {
        this.treeView.onKeyRight();
        break;
      }
      case KEY_CODE.D: {
        this.treeView.onKeyRight();
        break;
      }
      case KEY_CODE.SPACE: {
        this.treeView.onKeySelect();
        break;
      }
      case KEY_CODE.ENTER: {
        this.treeView.onKeySelect();
        break;
      }
      default: {
        console.log(event);
      }
    }
  }

  onFilterChange(value: string) {
    console.log('filter:', value);
  }

  logSelect(e) {
    console.log(e);
  }

  logAdd(e) {
    console.log(e);
  }
}
