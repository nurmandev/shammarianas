"use client";
import React from "react";
import data from "../../../../data/portfolios/works1";
import { Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

function Portfolio() {
  const marquess = ["Our Portfolio"];
  const AllMarquess = Array(10).fill(marquess).flat();

  return (
    <section className="work-fade section-padding sub-bg bord-top-grd bord-bottom-grd">
      <div className="container position-re">
        {/* Section Header */}
        <div className="sec-head mb-80 d-flex align-items-center">
          <div>
            <span className="sub-title main-color mb-5">Our Portfolio</span>
            <h3 className="fw-600 fz-50 text-u d-rotate wow">
              <span className="rotate-text">
                Selected <span className="fw-200">Works.</span>
              </span>
            </h3>
          </div>
          <div className="ml-auto vi-more">
            <a href="/portfolio-gallery" className="butn butn-sm butn-bord radius-30">
              <span>View All</span>
            </a>
            <span className="icon ti-arrow-top-right"></span>
          </div>
        </div>

        {/* Portfolio Swiper */}
        <div className="row">
          <div className="col-lg-2 d-flex align-items-end">
            <div className="text pb-100">
              <p>
                We help our clients succeed by creating identities, digital
                experiences, and print materials that communicate clearly.
              </p>
            </div>
          </div>
          <div className="col-lg-9">
            <div className="work-swiper">
              <Swiper
                modules={[Pagination, Navigation]}
                slidesPerView="auto"
                spaceBetween={80}
                loop={true}
                touchRatio={0.2}
                speed={1500}
                pagination={{ clickable: true }}
                navigation={true}
                className="swiper-container"
              >
                {data?.map((item, i) => (
                  <SwiperSlide key={i}>
                    <div className="item">
                      <div className="img">
                        <img src={item.img} alt={item.title} className="radius-15" />
                      </div>
                      <div className="cont">
                        <h3>
                          <span className="text sub-bg">{item.title}</span>
                          <span className="text sub-bg">{item.subTitle}</span>
                        </h3>
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>
        </div>

        {/* Scrolling Text */}
        <div className="marq-head">
          <div className="main-marq xlrg text-u o-hidden">
            <div className="slide-har st1">
              {[...Array(2)].map((_, index) => (
                <div key={index} className="box">
                  {AllMarquess.map((item, i) => (
                    <div key={i} className="item">
                      <h4>{item}</h4>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Portfolio;
