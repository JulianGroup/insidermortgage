import React, { useEffect } from 'react';
import './Testimonials.css';

const Testimonials = () => {
  useEffect(() => {
    if (!document.getElementById('jotform-widget-script')) {
      const script = document.createElement('script');
      script.id = 'jotform-widget-script';
      script.src = 'https://www.jotform.com/website-widgets/embed/019e8576208670b48ce5b752598ff8e0e156';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);
  const reviews = [
    {
      id: 1,
      name: 'Christine Guillen',
      text: "Working with David was an excellent experience. He took the time to thoroughly explain the loan process and went above and beyond by creating videos to help break down the numbers in a simple and understandable way. I truly appreciated his patience, transparency, and willingness to answer every question. He carefully reviewed different options with me and showed possibilities on how I could save money, which made me feel confident in my decisions. Throughout the process, he was professional, knowledgeable, and genuinely cared about helping me find the best financial option. I highly recommend him to anyone looking for a lender who is honest.",
      initials: 'CG',
      source: 'Google Review'
    },
    {
      id: 2,
      name: 'Drew Manier',
      text: "I'm self-employed, so getting financing for a new construction condo in Redondo Beach came with its own set of hurdles. Rakesh handled it using alternative documentation and got it done. But what really stood out was how he managed the whole process. He was the quarterback. He kept tabs on everyone involved, the escrow, the title, the insurance people, making sure nothing fell through the cracks and that everything stayed on track to close on time. A diligent mortgage broker to know, with great follow through and the kind of person who actually coordinates well between all the moving parts. I felt at ease with him in my corner. A 5 star service for homebuyers!",
      initials: 'DM',
      source: 'Google Review'
    },
    {
      id: 3,
      name: 'Ashish Sinha',
      text: "When I was looking for a mortgage broker in Orange County, my friend recommended Rakesh at Insider Mortgage, and I reached out to him even before I started looking for a house just to understand the process. Even when I wasn’t ready to buy or commit, he was happy to spend time going over everything without any catches. He communicated clearly, responded quickly to questions over text or email, and was flexible almost any time of day, even on weekends. We were selling one house and buying another, and he helped us understand what made the most sense and how the overall home loan process works. I could tell the advice he gave was honest and truly aimed at helping me, not just making a sale. He even provided worksheets that broke down my monthly payments and showed exactly how the numbers were calculated. The entire home loan experience with Rakesh was far better than my previous lender when I bought new construction. With other lenders, someone else would answer the phone, and it could take a day or more to get a response. Even when he was busy, Rakesh would send a quick message to let me know he would follow up. There is no comparison in terms of service, availability, and guidance during a big transaction like this. He doesn’t just do the basics; he gives you everything you need to make smart, confident decisions. It was such a positive experience that I’ve already recommended him to my cousin, who used him for a refinance last year.",
      initials: 'AS',
      source: 'Google Review'
    },
    {
      id: 4,
      name: 'Garen Doyle',
      text: "I was introduced to David at Insider Mortgage by our realtor when we first purchased a home in San Diego. Since then, we've refinanced three different times with them, and it's been a positive experience every time. The guys work around the clock and are convenient, working with my strange schedule to make sure everything happens when it needs to. They're reachable by phone or email, and they seem to be trustworthy and solid guys. What stands out is their approachability and how thorough they are with their spreadsheets and numbers, really doing the math for you and breaking down what financially makes sense. They walked me through the refinancing process and properly explained it so I always knew what was going on. They're very easy to get a hold of, which is important. If I decide to buy or refinance again in the future, David would definitely be the person I'd call or recommend to others.",
      initials: 'GD',
      source: 'Google Review'
    }
  ];

  return (
    <section className="testimonials-section" id="reviews">
      <div className="container">
        <div className="testimonials-header">
          <h2>Client Success Stories</h2>
          <p>Don't just take our word for it. Here is what our clients have to say about working with Insider Mortgage.</p>
        </div>

        {/* Jotform Custom Widget */}
        <div id="JFWebsiteWidget-019e8576208670b48ce5b752598ff8e0e156" style={{ width: '100%', margin: 'var(--space-8) 0' }}></div>

        <div className="testimonials-grid">
          {reviews.map((review) => (
            <div className="testimonial-card" key={review.id}>
              <div className="stars">★★★★★</div>
              <p className="review-text">"{review.text}"</p>
              
              <div className="reviewer-info">
                <div className="reviewer-avatar">{review.initials}</div>
                <div>
                  <div className="reviewer-name">{review.name}</div>
                  <div className="reviewer-source">{review.source}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
