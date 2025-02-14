"use client";
import React from "react";
import data from "../../../data/testimonials.json";
import { Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

function Testimonials() {
  return (
    <section className="testimonials">
      <div className="container section-padding bord-top-grd">
        <div className="row">
          {/* Image Section */}
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

          {/* Testimonials Swiper */}
          <div className="col-lg-8">
            <div className="cont-full">
              <div className="testim-swiper">
                <Swiper
                  modules={[Pagination, Navigation]}
                  spaceBetween={30}
                  loop={true}
                  pagination={{ clickable: true }}
                  navigation={true}
                  className="swiper-container"
                >
                  {data.slice(0, 2).map((item, i) => (
                    <SwiperSlide key={i}>
                      <div className="item">
                        <div className="content">
                          <div className="text">
                            <p className="fz-30">{item.desc}</p>
                          </div>
                          <div className="info d-flex align-items-center pt-40 mt-40 bord-thin-top">
                            <div className="fit-img circle">
                              <img src={item.img} alt={item.name} />
                            </div>
                            <div className="ml-20">
                              <h5>{item.name}</h5>
                              <span className="sub-title main-color">
                                {item.subName}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>

                {/* Quote SVG */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="256.721"
                  height="208.227"
                  viewBox="0 0 256.721 208.227"
                  className="qout-svg"
                >
                  <path
                    data-name="Path"
                    d="M-23.723-530.169v97.327H-121.05v-68.7q0-40.076,13.359-73.472T-62.845-639.9l36.259,28.625Q-63.8-570.244-68.57-530.169Zm158.395,0v97.327H37.345v-68.7q0-40.076,13.359-73.472T95.55-639.9l36.259,28.625Q94.6-570.244,89.825-530.169Z"
                    transform="translate(121.55 640.568)"
                    fill="none"
                    stroke="#fff"
                    strokeWidth="1"
                    opacity="0.322"
                  ></path>
                </svg>
              </div>

              {/* Swiper Navigation Arrows */}
              <div className="swiper-arrow-control control-abslout">
                <div className="swiper-button-prev">
                  <span className="ti-arrow-left"></span>
                </div>
                <div className="swiper-button-next">
                  <span className="ti-arrow-right"></span>
                </div>
              </div>

              {/* Background Blur Effect */}
              <div className="circle-blur">
                <img src="/assets/imgs/patterns/blur1.png" alt="Blur Effect" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Testimonials;
