import { Component, OnInit, ViewChild } from "@angular/core";
import { orderDetails } from "./data";

import {
  ReturnOption,
  Predicate,
  DataManager,
  Query,
  DataUtil
} from "@syncfusion/ej2-data";
import {
  Grid,
  Toolbar,
  Page,
  ColumnModel,
  GridComponent
} from "@syncfusion/ej2-angular-grids";
import { RuleModel, QueryBuilderComponent } from "@syncfusion/ej2-angular-querybuilder";

@Component({
  selector: "app-root",
  templateUrl: "app.component.html"
})
export class AppComponent {
  public data: Object[] = [];

  @ViewChild("grid", { static: true })
  public grid: GridComponent;
  @ViewChild("querybuilder")
  public qryBldrObj: QueryBuilderComponent;

  public format: object = { type: "date", format: "yyyy-MM-dd" };
  ngOnInit(): void {
    this.data = orderDetails;
  }
  onLoad(): void {
    // Keyup event bound to the input element
    this.grid.element.addEventListener("keyup", (args: KeyboardEvent) => {
      if (
        (args.target as HTMLElement).getAttribute("id") === "toolSearch" &&
        args.key === "Enter"
      ) {
        let gridObj: Grid = this.grid;
        // Regex for checking date of format – “dd/MM/yyyy”
        var regex = /^\d{4}-((0\d)|(1[012]))-(([012]\d)|3[01])$/;
        // Test regex with the entered value
        let input: HTMLInputElement = args.target as HTMLInputElement;
        if (regex.test(input.value)) {
          var count = 0;
          var predicates;
          // Value is split to form JavaScript’s Date object
          var dateSplit = input.value.split("-");
          var dateVal = new Date(
            parseInt(dateSplit[0]),
            parseInt(dateSplit[1]) - 1,
            parseInt(dateSplit[2])
          );
          while (count < gridObj.columns.length) {
            // Predicate is generated for all columns with type as ‘date’
            let col: ColumnModel = gridObj.columns[count] as ColumnModel;
            if (col.type === "date") {
              // Predicates are generated with the column field name and date object value
              predicates =
                predicates === undefined
                  ? new Predicate(col.field, "contains", dateVal)
                  : predicates.or(col.field, "contains", dateVal);
            }
            count++;
          }
          // Data manager is executed with grid’s datasource and query generated based on the predicates
          new DataManager({ json: gridObj.dataSource as object[] })
            .executeQuery(new Query().where(predicates))
            .then((e: ReturnOption) => {
              // The returned result is assigned to the grid datasource
              gridObj.dataSource = e.result as object[];
            });
        } else if (input.value === "") {
          if (gridObj.searchSettings.key === "") {
            var data = orderDetails;
            // If the input value and search key is empty the entire data source is assigned to the grid
            gridObj.dataSource = DataUtil.parse.parseJson(data);
          } else {
            // If the input value is empty but the grid contains a search key, then another search is performed with empty value to remove the search
            gridObj.search("");
          }
        } else {
          // Grid search method is called with the input value
          gridObj.search(input.value);
        }
      }
    });
  }
  public getFilter() {
    console.log(this.qryBldrObj);

    const laQuery = this.qryBldrObj.getDataManagerQuery(this.qryBldrObj.rule);

    const predicate: Predicate = new Predicate("CustomerName", "startswith", "A");
    console.log("locale", predicate);

    const ilPredicate = this.qryBldrObj.getPredicate(this.qryBldrObj.rule ) as Predicate;
    console.log("costruito il predicato", ilPredicate);

    new DataManager({ json: this.data as object[] })
      .executeQuery(
        new Query()
          .select(["CustomerName", "OrderID"])
          .where(ilPredicate as Predicate)
          .take(19)
      )
      .then((e: ReturnOption) => {
        console.log("result", e);
        // The returned result is assigned to the grid datasource
        this.grid.dataSource = e.result as object[];
      });
    /*         new DataManager({ json: (this.data as object[]) })
        .executeQuery(new Query().select(['name', 'company']).
            where(ilPredicate).
            take(19)).then((e: ReturnOption) => {
            // The returned result is assigned to the grid datasource
            this.gridObj.dataSource = e.result as object[];
        });
 */
  }
}
