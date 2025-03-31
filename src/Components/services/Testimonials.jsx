"use client";
import React from "react";
import { Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

function Testimonials() {
  return (
    <section className="testimonials">
      <div className="container section-padding bord-bottom-grd">
        <div className="row">
          <div className="col-lg-4 md-mb50">
            <div className="img-full">
              <div className="fit-img">
                <img src="/assets/imgs/testim/bg.jpg" alt="Background" />
              </div>
              <div className="fix-img">
                <img src="/assets/imgs/arw1.png" alt="Arrow" />
              </div>
            </div>
          </div>
          <div className="col-lg-8">
            <div className="cont-full">
              <Swiper
                modules={[Pagination, Navigation]}
                loop={true}
                spaceBetween={30}
                pagination={{ clickable: true }}
                navigation={{
                  nextEl: ".swiper-button-next",
                  prevEl: ".swiper-button-prev",
                }}
                className="swiper-container"
              >
                <SwiperSlide>
                  <div className="item">
                    <div className="content">
                      <div className="text">
                        <p className="fz-30">
                          With Sham-Marianas expert strategies and innovative
                          solutions, we optimized our operations and unlocked
                          new growth opportunities, setting us on the path to
                          success.
                        </p>
                      </div>
                      <div className="info d-flex align-items-center pt-40 mt-40 bord-thin-top">
                        <div className="fit-img circle">
                          <img
                            src="/assets/imgs/testim/t1.jpg"
                            alt="Testimonial"
                          />
                        </div>
                        <div className="ms-20">
                          <h5>Adam Beckley</h5>
                          <span className="sub-title main-color">
                            Founder & CEO
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>

                <SwiperSlide>
                  <div className="item">
                    <div className="content">
                      <div className="text">
                        <p className="fz-30">
                          We gave Sham-Marianas a challenging task—to simplify a
                          complex issue and engage key stakeholders. They
                          delivered an innovative, compelling solution that
                          captured attention and drove results.
                        </p>
                      </div>
                      <div className="info d-flex align-items-center pt-40 mt-40 bord-thin-top">
                        <div className="fit-img circle">
                          <img
                            src="/assets/imgs/testim/t2.jpg"
                            alt="Testimonial"
                          />
                        </div>
                        <div className="ms-20">
                          <h5>John Doe</h5>
                          <span className="sub-title main-color">CTO</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
                <SwiperSlide>
                  <div className="item">
                    <div className="content">
                      <div className="text">
                        <p className="fz-30">
                          Sham-Marianas exceeded our expectations with their
                          exceptional services. From branding to website design,
                          they delivered creative, original, and impactful
                          solutions that perfectly conveyed our vision.
                        </p>
                      </div>
                      <div className="info d-flex align-items-center pt-40 mt-40 bord-thin-top">
                        <div className="fit-img circle">
                          <img
                            src="/assets/imgs/testim/t2.jpg"
                            alt="Testimonial"
                          />
                        </div>
                        <div className="ms-20">
                          <h5>John Doe</h5>
                          <span className="sub-title main-color">CTO</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
                <SwiperSlide>
                  <div className="item">
                    <div className="content">
                      <div className="text">
                        <p className="fz-30">
                          We partnered with Sham-Marianas to elevate our brand
                          and market positioning. They delivered exceptional
                          results—an impressive brand identity, strategic
                          campaigns, and outstanding support at every step.
                        </p>
                      </div>
                      <div className="info d-flex align-items-center pt-40 mt-40 bord-thin-top">
                        <div className="fit-img circle">
                          <img
                            src="/assets/imgs/testim/t2.jpg"
                            alt="Testimonial"
                          />
                        </div>
                        <div className="ms-20">
                          <h5>John Doe</h5>
                          <span className="sub-title main-color">CTO</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
                <SwiperSlide>
                  <div className="item">
                    <div className="content">
                      <div className="text">
                        <p className="fz-30">
                          I highly recommend Sham-Marianas for their strategic
                          and results-driven approach. They provided actionable
                          solutions that optimized our operations, enhanced
                          efficiency, and delivered outstanding results with
                          professionalism and precision.
                        </p>
                      </div>
                      <div className="info d-flex align-items-center pt-40 mt-40 bord-thin-top">
                        <div className="fit-img circle">
                          <img
                            src="/assets/imgs/testim/t2.jpg"
                            alt="Testimonial"
                          />
                        </div>
                        <div className="ms-20">
                          <h5>John Doe</h5>
                          <span className="sub-title main-color">CTO</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
                <SwiperSlide>
                  <div className="item">
                    <div className="content">
                      <div className="text">
                        <p className="fz-30">
                          Sham-Marianas impressed us with their unique and
                          innovative approach. Their solution received
                          overwhelming praise from our leadership team.
                        </p>
                      </div>
                      <div className="info d-flex align-items-center pt-40 mt-40 bord-thin-top">
                        <div className="fit-img circle">
                          <img
                            src="/assets/imgs/testim/t2.jpg"
                            alt="Testimonial"
                          />
                        </div>
                        <div className="ms-20">
                          <h5>John Doe</h5>
                          <span className="sub-title main-color">CTO</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
                <SwiperSlide>
                  <div className="item">
                    <div className="content">
                      <div className="text">
                        <p className="fz-30">
                          Sham-MarianSall delivered impactful and creative
                          solutions that strengthened our community outreach
                          efforts.
                        </p>
                      </div>
                      <div className="info d-flex align-items-center pt-40 mt-40 bord-thin-top">
                        <div className="fit-img circle">
                          <img
                            src="/assets/imgs/testim/t2.jpg"
                            alt="Testimonial"
                          />
                        </div>
                        <div className="ms-20">
                          <h5>John Doe</h5>
                          <span className="sub-title main-color">CTO</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              </Swiper>

              <div className="swiper-arrow-control control-abslout">
                <div className="swiper-button-prev">
                  <span className="ti-arrow-left"></span>
                </div>
                <div className="swiper-button-next">
                  <span className="ti-arrow-right"></span>
                </div>
              </div>

              <div className="circle-blur">
                <img
                  src="/assets/imgs/patterns/blur1.png"
                  alt="Blurred Pattern"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Testimonials;
