import { UserCompany, CompanyRole } from '../../../api/CompanyApi';
import { Link } from 'react-router-dom';
import React, { useState, useEffect, useRef } from 'react';
import './CompanyCard.scss';
import { rgbToHsl, hslToRgb, getDynamicBackground, getCompanyInitials, truncateDescription } from './utils';

interface CompanyCardProps {
  userCompany: UserCompany;
  onDelete: (companyId: string) => void;
}

const CompanyCard: React.FC<CompanyCardProps> = ({ userCompany }) => {
  if (!userCompany) {
    return null;
  }
  
  const companyIdField = userCompany.companyId;
  const companyIdIsObject = typeof companyIdField === 'object' && companyIdField !== null;
  
  let company;
  let actualCompanyId;
  
  if (companyIdIsObject && companyIdField && typeof companyIdField === 'object' && '_id' in companyIdField) {
    company = companyIdField as any;
    actualCompanyId = company._id;
  } else if (userCompany.company) {
    company = userCompany.company;
    actualCompanyId = userCompany.companyId as string;
  } else {
    actualCompanyId = userCompany.companyId as string;
    company = {
      _id: actualCompanyId,
      name: 'Unnamed Company',
      description: 'No description available',
      logoUrl: '',
      createdAt: new Date().toISOString(),
      createdBy: '',
      updatedAt: new Date().toISOString()
    };
  }
  
  if (!actualCompanyId || actualCompanyId === 'null' || actualCompanyId === 'undefined') {
    console.error('Invalid company ID detected:', actualCompanyId);
    
    if (userCompany._id) {
      actualCompanyId = userCompany._id;
    } else {
      return (
        <div className="company-card broken-data">
          <div className="company-card-content">
            <h3 className="company-name">Invalid Company Data</h3>
            <p className="company-description">This company has invalid data and cannot be displayed properly.</p>
          </div>
        </div>
      );
    }
  }
  
  const role = userCompany.role || CompanyRole.MEMBER;

  const [logoLoaded, setLogoLoaded] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [logoBgColor, setLogoBgColor] = useState<string | null>(null);
  const logoContainerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  
  const [isCardVisible, setIsCardVisible] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setIsCardVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);
  
  const getRoleBadgeClass = () => {
    switch(role) {
      case CompanyRole.OWNER:
        return 'owner-badge';
      case CompanyRole.ADMIN:
        return 'admin-badge';
      default:
        return 'member-badge';
    }
  };
  
  const formatDate = () => {
    try {
      if (!company.createdAt) {
        return "Recently created";
      }

      const date = new Date(company.createdAt);
      
      if (isNaN(date.getTime())) {
        return "Recently created";
      }
      
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return "Recently created";
    }
  };

  useEffect(() => {
    if (logoLoaded && imgRef.current && !logoError) {
      try {
        const img = imgRef.current;
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        if (!context) return;
        
        canvas.width = 50;
        canvas.height = 50;
        
        context.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        let r = 0, g = 0, b = 0, count = 0;
        
        for (let i = 0; i < data.length; i += 4) {
          if (data[i + 3] > 128) {
            r += data[i];
            g += data[i + 1];
            b += data[i + 2];
            count++;
          }
        }
        
        if (count > 0) {
          r = Math.floor(r / count);
          g = Math.floor(g / count);
          b = Math.floor(b / count);
          
          const hslColor = rgbToHsl(r, g, b);
          const lightColor = hslToRgb(hslColor.h, Math.min(hslColor.s, 0.3), 0.95);
          const secondaryColor = hslToRgb(hslColor.h, Math.min(hslColor.s, 0.25), 0.90);
          
          setLogoBgColor(`linear-gradient(145deg, rgb(${lightColor.r}, ${lightColor.g}, ${lightColor.b}), rgb(${secondaryColor.r}, ${secondaryColor.g}, ${secondaryColor.b}))`);
        }
      } catch (error) {
        console.error('Error extracting color from logo:', error);
      }
    }
  }, [logoLoaded, logoError]);
  
  const handleImageError = () => {
    setLogoError(true);
  };
  
  return (
    <div className={`company-card ${isCardVisible ? 'visible' : ''}`}>
      <div 
        className="company-card-logo" 
        style={getDynamicBackground(company.name, logoBgColor)}
      >
        <div className="logo-container" ref={logoContainerRef}>
          {company.logoUrl && !logoError ? (
            <img 
              ref={imgRef}
              src={company.logoUrl} 
              alt={`${company.name} logo`}
              onLoad={() => setLogoLoaded(true)}
              onError={handleImageError}
              className={logoLoaded ? 'loaded' : ''}
              crossOrigin="anonymous"
            />
          ) : (
            <div className="company-initials">
              {getCompanyInitials(company.name)}
            </div>
          )}
        </div>
      </div>
      
      <div className="company-card-content">
        <div className="company-header">
          <h3 className="company-name">{company.name}</h3>
          <span className={`company-role ${getRoleBadgeClass()}`}>{role}</span>
        </div>
        <p className={`company-created ${company.createdAt && !isNaN(new Date(company.createdAt).getTime()) ? '' : 'recently-created'}`}>{formatDate()}</p>
        <p className="company-description">{truncateDescription(company.description)}</p>
      </div>
      
      <div className="company-card-actions">
        <Link 
          to={`/companies/${actualCompanyId}`} 
          className="view-btn"
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

export default CompanyCard; 