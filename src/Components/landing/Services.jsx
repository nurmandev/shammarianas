"use client";
import React from "react";
import { Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
const data = [
  {
    id: 1,
    title: "Branding Design",
    img: "/assets/imgs/serv-icons/3.png",
    desc: "Our branding design creates strong brand identities that attract audiences, build recognition, and grow businesses for long-term success.",
    link: "/services/branding-design",
  },
  {
    id: 2,
    title: "UI-UX Design",
    img: "/assets/imgs/serv-icons/5.png",
    desc: "We offer UI/UX design that creates smooth, user-friendly experiences that boost engagement, conversions, and brand success, making every interaction seamless and enjoyable.",
  },
  {
    id: 3,
    title: "Web Development",
    img: "/assets/imgs/serv-icons/4.png",
    desc: "At Sham Marianas, we build cutting-edge web development solutions that blend innovation, performance, and seamless user experiences to help businesses thrive online.",
    link: "/services/web-development",
  },
  {
    id: 4,
    title: "E-Commerce Solutions",
    img: "/assets/imgs/serv-icons/5.png",
    desc: "We build e-commerce solutions that make online selling seamless and profitable. Our expert services enhance customer reach, conversions, and sales growth.",
    link: "/services/ecommerce-solutions",
  },
  {
    id: 5,
    title: "Content Writing",
    img: "/assets/imgs/serv-icons/3.png",
    desc: "We create SEO-friendly content writing that captures attention, builds authority, and boosts online presence.",
    link: "/services/content-writing",
  },
  {
    id: 6,
    title: "Product Design",
    img: "/assets/imgs/serv-icons/5.png",
    desc: "We provide the best product design, creating seamless, user-focused experiences that drive engagement, innovation, and business success.",
    link: "/services/product-design",
  },
  {
    id: 7,
    title: "Social Media & Digital Marketing",
    img: "/assets/imgs/serv-icons/4.png",
    desc: "We help businesses grow with social media & digital marketing, increasing brand awareness, interaction, and online reach.",
    link: "/services/social-media-digital-marketing",
  },
  {
    id: 8,
    title: "Photography & Video Production",
    img: "/assets/imgs/serv-icons/5.png",
    desc: "We deliver photography & video production that captures your brand’s story, enhancing engagement, visibility, and trust with high-impact visuals.",
    link: "/services/photography-video-production",
  },
  {
    id: 9,
    title: "VFX and CGI ADs",
    img: "/assets/imgs/serv-icons/4.png",
    desc: "We design eye-catching VFX and CGI ads that boost brand visibility, engagement, and audience impact with stunning, high-quality visuals.",
    link: "/services/vfx-cgi-ads",
  },
  {
    id: 10,
    title: "Print Media Solution",
    img: "/assets/imgs/serv-icons/5.png",
    desc: " We craft print media solutions that boost brand visibility, marketing impact, and audience engagement with high-quality designs and materials.",
    link: "/services/print-media-solution",
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
                <div
                  className="item-box"
                  style={{
                    width: "400px", // Fixed width for the card
                    height: "450px", // Fixed height for the card
                    display: "flex", // Flexbox for alignment
                    flexDirection: "column", // Vertical alignment of content
                    justifyContent: "space-between", // Space out content vertically
                    alignItems: "start", // Center content horizontally
                    padding: "40px", // Padding for spacing
                    boxSizing: "border-box", // Include padding in  // Optional: Add a border
                    padding: "40px", // Padding inside the card
          // Optional: Rounded corners
                 // Optional: Background color
                  
                    overflow: "hidden", // Prevent content overflow
                  }}
                >
                  <div className="icon mb-40 opacity-5">
                    <img
                      src={item.img}
                      alt=""
                      style={{
                        maxWidth: "100%", // Ensure the image fits within the card
                        maxHeight: "100%", // Prevent image overflow
                      }}
                    />
                  </div>
                  <h5 className="mb-15">{item.id}. {item.title}</h5>
                  <p style={{ textAlign: "start" }}>{item.desc}</p>
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
