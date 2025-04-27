import { useEffect } from "react";
import BookList from "./BookList";

export default function AllBooks() {
  return (
    <div className="main-bg">
      <header
        className=" page-header bg-img section-padding valign"
        data-background="./assets/imgs/background/bg4.jpg"
        data-overlay-dark="8"
      >
        <div className="container pt-80">
          <div className="row">
            <div className="col-12">
              <div className="text-center">
                <h1 className="text-u ls1 fz-80">
                  Blog <span className="fw-200"> Standard</span>
                </h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* BookList */}
      {/* <BookList order="asc" field="title" /> */}
    </div>
  );
}
