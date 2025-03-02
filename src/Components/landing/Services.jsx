"use client";
import React from "react";
import { Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

const data = [
  {
    title: "Digital Product Design",
    img: "/assets/imgs/serv-icons/3.png",
    desc: "Live workshop where we define the main problems and challenges before building a strategic plan moving forward.",
    link: "/page-services-details",
  },
  {
    title: "Web Developments",
    img: "/assets/imgs/serv-icons/4.png",
    desc: "Live workshop where we define the main problems and challenges before building a strategic plan moving forward.",
    link: "/page-services-details",
  },
  {
    title: "Branding Design",
    img: "/assets/imgs/serv-icons/5.png",
    desc: "Live workshop where we define the main problems and challenges before building a strategic plan moving forward.",
    link: "/page-services-details",
  },
  {
    title: "UI-UX Design",
    img: "/assets/imgs/serv-icons/5.png",
    desc: "Live workshop where we define the main problems and challenges before building a strategic plan moving forward.",
    link: "/page-services-details",
  },
];
function Services() {
  const swiperOptions = {
    modules: [Navigation],
    loop: true,
    spaceBetween: 40,
    slidesPerView: 3,
    breakpoints: {
      0: {
        slidesPerView: 1,
      },
      640: {
        slidesPerView: 1,
      },
      768: {
        slidesPerView: 2,
      },
      1024: {
        slidesPerView: 3,
      },
    },

    navigation: {
      nextEl: ".services .swiper-button-next",
      prevEl: ".services .swiper-button-prev",
    },
  };
  return (
    <section className="services section-padding overflow-hidden">
      <div
        style={{
          width: "100%",
          paddingLeft: "0.75rem",
          paddingRight: "0.75rem",
          maxWidth: "1280px",
          marginRight: "auto",
          marginLeft: "auto",
        }}
      >
        <div className="sec-head mb-80">
          <div className="d-flex align-items-center">
            <div>
              <span className="sub-title main-color mb-5">Our Specialize</span>
              <h3 className="fw-600 fz-50 text-u d-rotate wow">
                <span className="rotate-text">
                  Featured <span className="fw-200">Services.</span>
                </span>
              </h3>
            </div>
            <div className="ml-auto">
              <div className="swiper-arrow-control">
                <div className="swiper-button-prev">
                  <span className="ti-arrow-left"></span>
                </div>
                <div className="swiper-button-next">
                  <span className="ti-arrow-right"></span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div
          className="serv-swiper"
          data-carousel="swiper"
          data-loop="true"
          data-space="40"
        >
          <Swiper
            {...swiperOptions}
            id="content-carousel-container-unq-serv"
            className="swiper-container"
            data-swiper="container"
          >
            {data.map((item, i) => (
              <SwiperSlide key={i}>
                <div className="item-box">
                  <div className="icon mb-40 opacity-5">
                    <img src={item.img} alt="" />
                  </div>
                  <h5 className="mb-15">{item.title}</h5>
                  <p>{item.desc}</p>
                  <a href={item.link} className="rmore mt-30 flex">
                    <span className="sub-title">Read More</span>
                    <img
                      src="/assets/imgs/arrow-right.png"
                      alt=""
                      className="icon-img-20 ml-5"
                    />
                  </a>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
}

export default Services;
