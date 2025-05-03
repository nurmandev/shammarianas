"use client";
import React from "react";
import { Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

const data = [
  {
    title: "Branding Design",
    img: "/assets/imgs/serv-icons/3.png",
    desc: "We build strong brand identities that connect with audiences, boost recognition, and support long-term business growth.",
    link: "/services/branding",
  },
  {
    title: "UI-UX Design",
    img: "/assets/imgs/serv-icons/5.png",
    desc: "We design smooth and engaging user interfaces that enhance usability, increase conversions, and elevate brand experiences.",
    link: "/services/uiux-design",
  },
  {
    title: "Web Developments",
    img: "/assets/imgs/serv-icons/4.png",
    desc: "We create modern websites with top performance, seamless navigation, and responsive design to help your brand thrive online.",
    link: "/services/web-design",
  },
  {
    title: "E-Commerce Solutions",
    img: "/assets/imgs/serv-icons/5.png",
    desc: "We deliver user-friendly e-commerce platforms that improve customer experience, boost sales, and drive online business success.",
    link: "/services/ecommerce",
  },
  {
    title: "Content Writing",
    img: "/assets/imgs/serv-icons/3.png",
    desc: "We write compelling, SEO-optimized content that attracts audiences, builds trust, and strengthens your digital presence.",
    link: "/services/content",
  },
  {
    title: "Product Design",
    img: "/assets/imgs/serv-icons/5.png",
    desc: "We design intuitive and innovative products that focus on user needs, driving engagement, satisfaction, and business success.",
    link: "/services/product",
  },
  {
    title: "Social Media & Digital Marketing",
    img: "/assets/imgs/serv-icons/4.png",
    desc: "We grow your business with marketing strategies that boost visibility, improve interaction, and maximize digital reach.",
    link: "/services/digital",
  },
  {
    title: "Photography & Video Production",
    img: "/assets/imgs/serv-icons/5.png",
    desc: "We create stunning visuals and videos that tell your story, increase brand appeal, and captivate your target audience.",
    link: "/services/video-production",
  },
  {
    title: "VFX and CGI ADs",
    img: "/assets/imgs/serv-icons/4.png",
    desc: "We craft high-quality VFX and CGI ads that grab attention, enhance brand identity, and leave lasting impressions.",
    link: "/services/vfx",
  },
  {
    title: "Print Media Solution",
    img: "/assets/imgs/serv-icons/5.png",
    desc: "We offer premium print design solutions that amplify marketing efforts and reinforce brand presence through quality visuals.",
    link: "/services/printing",
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
    <section className="services section-padding w-full overflow-hidden">
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
                  Featured <span className="fw-200">Services</span>
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
