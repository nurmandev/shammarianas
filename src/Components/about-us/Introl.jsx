import React from "react";

function Intro() {
  return (
    <section className="page-intro section-padding pb-0">
      <div className="container">
        <div className="row md-marg">
          <div className="col-lg-6">
            <div className="img md-mb80">
              <div className="row">
                <div className="col-6">
                  <img src="/assets/imgs/intro/i1.jpg" alt="" />
                  <div className="img-icon">
                    <img src="/assets/imgs/arw0.png" alt="" />
                  </div>
                </div>
                <div className="col-6 mt-40">
                  <img src="/assets/imgs/intro/i2.jpg" alt="" />
                </div>
              </div>
            </div>
          </div>
          <div className="col-lg-6 valign">
            <div className="cont">
              <h3 className="mb-30">
                Ehtasham ul Haq,
                <span className="fw-200">
                  A seasoned expert with 12 years of experience in advertising,
                  started Sham Marianas in 2022. In order to convey depth and
                  purpose, the term{" "}
                </span>{" "}
                Sham Marianas
                <span className="fw-200">
                  was thoughtfully created by fusing significant words.{" "}
                </span>{" "}
                This platform was developed to provide expert, high-quality
                services with an emphasis on customer happiness, innovation, and
                dependability.
              </h3>
              <p>
                Sham Marianas provides professional solutions that are suited to
                both individual and commercial needs. His areas of expertise
                include digital marketing, web development, and logo design. It
                guarantees excellent outcomes that propel success with a
                talented staff and innovative tactics.
              </p>
              <p>
                Sham Marianas wants to become a prominent advertising agency
                brand by offering high-quality, reasonably priced solutions and
                ranking highly in search results. For success, Sham Marians is
                your go-to source for site design, SEO optimization, and
                professional digital solutions.
              </p>
              <a href="/page-services" className="underline main-color mt-40">
                <span className="text">
                  Our Services <i className="ti-arrow-top-right"></i>
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Intro;
