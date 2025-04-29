"use client";
import React from "react";

function Intro2() {
  function openAccordion(event) {
    document.querySelectorAll(".accordion-info").forEach((element) => {
      element.classList.remove("active");
      element.style.maxHeight = 0;
      element.parentElement.classList.remove("active");
    });
    event.currentTarget.parentElement.classList.add("active");
    event.currentTarget.nextElementSibling.style.maxHeight = "300px";
    event.currentTarget.nextElementSibling.classList.add("active");
  }
  return (
    <>
      <section className="intro section-padding">
        <div className="container">
          <div className="row lg-marg">
            <div className="col-lg-8">
              <div className="row lg-marg">
                <div className="col-md-6">
                  <h6 className="sub-title main-color mb-15">
                    The Power of UI/UX Design
                  </h6>

                  <div className="text">
                    <p className="mb-15">
                      Sham Marianas delivers smart, user-focused UI/UX design
                      that combines beauty and usability. We craft intuitive
                      digital experiences that elevate your brand. From startups
                      to enterprises, we turn ideas into powerful, engaging
                      interfaces.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="intro-accord">
        <div className="container ontop">
          <div className="row xlg-marg">
            <div className="col-lg-6">
              <div className="img md-mb50">
                <img src="/assets/imgs/arw2.png" alt="" />
              </div>
            </div>
            <div className="col-lg-6 valign">
              <div>
                <div className="sec-head mb-50">
                  <h6 className="sub-title main-color mb-15">
                    Why Do You Need UI/UX Services in Today&apos;s Digital
                    World?
                  </h6>
                  <h3>
                    The creative process behind <br /> our digital marketing.
                  </h3>
                </div>
                <div className="accordion bord">
                  <div
                    className="item active wow fadeInUp"
                    data-wow-delay=".1s"
                  >
                    <div onClick={openAccordion} className="title">
                      <h6>Designing Content With AI Power</h6>
                      <span className="ico ti-plus"></span>
                    </div>
                    <div className="accordion-info">
                      <p className="">
                        Taken possession of my entire soul, like these sweet
                        mornings of spring which i enjoy with my whole.
                      </p>
                    </div>
                  </div>

                  <div className="item wow fadeInUp" data-wow-delay=".3s">
                    <div onClick={openAccordion} className="title">
                      <h6>Talented, Professional & Expert Team</h6>
                      <span className="ico ti-plus"></span>
                    </div>
                    <div className="accordion-info">
                      <p className="">
                        Taken possession of my entire soul, like these sweet
                        mornings of spring which i enjoy with my whole.
                      </p>
                    </div>
                  </div>

                  <div className="item wow fadeInUp" data-wow-delay=".5s">
                    <div onClick={openAccordion} className="title">
                      <h6>We Build and Activate Brands</h6>
                      <span className="ico ti-plus"></span>
                    </div>
                    <div className="accordion-info">
                      <p className="">
                        Taken possession of my entire soul, like these sweet
                        mornings of spring which i enjoy with my whole.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default Intro2;
