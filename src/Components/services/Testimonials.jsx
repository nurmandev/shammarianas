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
                          I have been hiring people in this space for a number
                          of years and I have never seen this level of
                          professionalism. It really feels like you are working
                          with a team that can get the job done.
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
                          I have been hiring people in this space for a number
                          of years and I have never seen this level of
                          professionalism. It really feels like you are working
                          with a team that can get the job done.
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
