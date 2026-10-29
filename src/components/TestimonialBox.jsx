import React from 'react';

const TestimonialBox = ({ title = "What Our Clients Say", quote, author, image }) => {
  return (
    <div style={{
      backgroundColor: '#eef6fc',
      borderLeft: '5px solid #007bff',
      padding: '2rem 3rem',
      borderRadius: '0 8px 8px 0',
      color: '#333',
      boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
      marginBottom: '2rem'
    }}>
      {title && (
        <h3 style={{ fontSize: '1.8rem', fontStyle: 'italic', marginBottom: '1.5rem', color: '#444' }}>
          {title}
        </h3>
      )}
      
      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
        {image && (
          <img 
            src={image} 
            alt={`${author} headshot`} 
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '3px solid white',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              flexShrink: 0
            }}
          />
        )}
        
        <div>
          <p style={{ fontStyle: 'italic', lineHeight: '1.8', marginBottom: '1.5rem', fontSize: '1.1rem' }}>
            "{quote}"
          </p>
          <p style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
            - {author}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TestimonialBox;
