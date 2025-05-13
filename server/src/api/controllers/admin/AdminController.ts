import { FastifyRequest, FastifyReply } from 'fastify';
import User, { UserRole } from '../../../data/models/User';
import Job from '../../../data/models/Jobs';
import Company from '../../../data/models/Company';
import { ApplicationStatus } from '../../../data/models/ApplicationStatus';
import bcrypt from 'bcrypt';

// User Management
const getAllUsers = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    console.log('Admin API: Fetching all users');
    const users = await User.find().select('-password');
    return reply.send(users);
  } catch (error) {
    console.error('Error in admin getAllUsers:', error);
    return reply.code(500).send({ error: 'Failed to fetch users', details: (error as Error).message });
  }
};

const getUserById = async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
  try {
    const { id } = request.params;
    console.log(`Admin API: Fetching user with ID: ${id}`);
    
    if (!id || id === 'undefined') {
      console.log('Admin API: Invalid user ID provided');
      return reply.code(400).send({ error: 'Invalid user ID provided' });
    }
    
    const user = await User.findById(id).select('-password');
    
    if (!user) {
      console.log(`Admin API: User not found with ID: ${id}`);
      return reply.code(404).send({ error: 'User not found' });
    }
    
    return reply.send(user);
  } catch (error) {
    console.error('Error in admin getUserById:', error);
    return reply.code(500).send({ error: 'Failed to fetch user', details: (error as Error).message });
  }
};

const createUser = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { name, email, role, title, bio, location, phoneNumber } = request.body as any;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    
    if (existingUser) {
      return reply.code(409).send({ error: 'User with this email already exists' });
    }
    
    // Create new user with a default password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);
    
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role,
      title: title || '',
      bio: bio || '',
      location: location || '',
      phoneNumber: phoneNumber || '',
    });
    
    await newUser.save();
    
    return reply.code(201).send({
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      title: newUser.title,
      bio: newUser.bio,
      location: newUser.location,
      phoneNumber: newUser.phoneNumber,
      createdAt: newUser.createdAt,
      updatedAt: newUser.updatedAt
    });
  } catch (error) {
    console.error('Error creating user:', error);
    return reply.code(500).send({ error: 'Failed to create user' });
  }
};

const updateUser = async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
  try {
    const { id } = request.params;
    const { name, email, role, title, bio, phoneNumber, location, profilePicture, socialLinks } = request.body as any;
    
    // Validate ID
    if (!id || id === 'undefined') {
      return reply.code(400).send({ error: 'Invalid user ID provided' });
    }
    
    // Check if user exists
    const existingUser = await User.findById(id);
    
    if (!existingUser) {
      return reply.code(404).send({ error: 'User not found' });
    }
    
    // Check if email is already taken by another user
    if (email && email !== existingUser.email) {
      const emailExists = await User.findOne({ email, _id: { $ne: id } });
      if (emailExists) {
        return reply.code(409).send({ error: 'Email is already taken by another user' });
      }
    }
    
    // Update user with only the fields that exist in schema
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (role !== undefined) updateData.role = role;
    if (title !== undefined) updateData.title = title;
    if (bio !== undefined) updateData.bio = bio;
    if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
    if (location !== undefined) updateData.location = location;
    if (profilePicture !== undefined) updateData.profilePicture = profilePicture;
    if (socialLinks !== undefined) updateData.socialLinks = socialLinks;
    
    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).select('-password');
    
    return reply.send(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    return reply.code(500).send({ error: 'Failed to update user' });
  }
};

const deleteUser = async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
  try {
    const { id } = request.params;
    
    // Validate ID
    if (!id || id === 'undefined') {
      return reply.code(400).send({ error: 'Invalid user ID provided' });
    }
    
    // Check if user exists
    const existingUser = await User.findById(id);
    
    if (!existingUser) {
      return reply.code(404).send({ error: 'User not found' });
    }
    
    // Delete user
    await User.findByIdAndDelete(id);
    
    return reply.code(204).send();
  } catch (error) {
    console.error('Error deleting user:', error);
    return reply.code(500).send({ error: 'Failed to delete user' });
  }
};

// Job Management
const getAllJobs = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    console.log('Admin API: Fetching all jobs');
    const jobs = await Job.find().populate('company', 'name').populate('employer', 'name email');
    console.log(`Admin API: Found ${jobs.length} jobs`);
    return reply.send(jobs);
  } catch (error) {
    console.error('Error in admin getAllJobs:', error);
    return reply.code(500).send({ error: 'Failed to fetch jobs', details: (error as Error).message });
  }
};

const getJobById = async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
  try {
    const { id } = request.params;
    
    if (!id || id === 'undefined') {
      return reply.code(400).send({ error: 'Invalid job ID provided' });
    }
    
    const job = await Job.findById(id).populate('company').populate('employer', 'name email');
    
    if (!job) {
      return reply.code(404).send({ error: 'Job not found' });
    }
    
    return reply.send(job);
  } catch (error) {
    console.error('Error fetching job:', error);
    return reply.code(500).send({ error: 'Failed to fetch job' });
  }
};

const updateJob = async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
  try {
    const { id } = request.params;
    const { 
      title, description, requirements, company, location, 
      salary, type, category, tags, status, expiresAt 
    } = request.body as any;
    
    if (!id || id === 'undefined') {
      return reply.code(400).send({ error: 'Invalid job ID provided' });
    }
    
    // Check if job exists
    const existingJob = await Job.findById(id);
    
    if (!existingJob) {
      return reply.code(404).send({ error: 'Job not found' });
    }
    
    // Update job with only the fields that exist in schema
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (requirements !== undefined) updateData.requirements = requirements;
    if (company !== undefined) updateData.company = company;
    if (location !== undefined) updateData.location = location;
    if (salary !== undefined) updateData.salary = salary;
    if (type !== undefined) updateData.type = type;
    if (category !== undefined) updateData.category = category;
    if (tags !== undefined) updateData.tags = tags;
    if (status !== undefined) updateData.status = status;
    if (expiresAt !== undefined) updateData.expiresAt = expiresAt;
    
    // Update job
    const updatedJob = await Job.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate('company', 'name');
    
    return reply.send(updatedJob);
  } catch (error) {
    console.error('Error updating job:', error);
    return reply.code(500).send({ error: 'Failed to update job' });
  }
};

const deleteJob = async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
  try {
    const { id } = request.params;
    
    if (!id || id === 'undefined') {
      return reply.code(400).send({ error: 'Invalid job ID provided' });
    }
    
    // Check if job exists
    const existingJob = await Job.findById(id);
    
    if (!existingJob) {
      return reply.code(404).send({ error: 'Job not found' });
    }
    
    // Delete job
    await Job.findByIdAndDelete(id);
    
    return reply.code(204).send();
  } catch (error) {
    console.error('Error deleting job:', error);
    return reply.code(500).send({ error: 'Failed to delete job' });
  }
};

// Company Management
const getAllCompanies = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    console.log('Admin API: Fetching all companies');
    const companies = await Company.find().populate('createdBy', 'name email');
    console.log(`Admin API: Found ${companies.length} companies`);
    return reply.send(companies);
  } catch (error) {
    console.error('Error in admin getAllCompanies:', error);
    return reply.code(500).send({ error: 'Failed to fetch companies', details: (error as Error).message });
  }
};

const getCompanyById = async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
  try {
    const { id } = request.params;
    
    if (!id || id === 'undefined') {
      return reply.code(400).send({ error: 'Invalid company ID provided' });
    }
    
    const company = await Company.findById(id).populate('createdBy', 'name email');
    
    if (!company) {
      return reply.code(404).send({ error: 'Company not found' });
    }
    
    return reply.send(company);
  } catch (error) {
    console.error('Error fetching company:', error);
    return reply.code(500).send({ error: 'Failed to fetch company' });
  }
};

const updateCompany = async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
  try {
    const { id } = request.params;
    const { name, description, logoUrl } = request.body as any;
    
    console.log('Admin API: Updating company', {
      id,
      requestBody: request.body,
      parsedValues: { name, description, logoUrl }
    });
    
    if (!id || id === 'undefined') {
      return reply.code(400).send({ error: 'Invalid company ID provided' });
    }
    
    // Check if company exists
    const existingCompany = await Company.findById(id);
    
    if (!existingCompany) {
      return reply.code(404).send({ error: 'Company not found' });
    }
    
    // Update company with only the fields that exist in schema
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (logoUrl !== undefined) updateData.logoUrl = logoUrl;
    
    console.log('Admin API: Update data to be applied:', updateData);
    
    // Update company
    const updatedCompany = await Company.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate('createdBy', 'name email');
    
    console.log('Admin API: Updated company result:', updatedCompany);
    
    return reply.send(updatedCompany);
  } catch (error) {
    console.error('Error updating company:', error);
    return reply.code(500).send({ error: 'Failed to update company' });
  }
};

const deleteCompany = async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
  try {
    const { id } = request.params;
    
    if (!id || id === 'undefined') {
      return reply.code(400).send({ error: 'Invalid company ID provided' });
    }
    
    // Check if company exists
    const existingCompany = await Company.findById(id);
    
    if (!existingCompany) {
      return reply.code(404).send({ error: 'Company not found' });
    }
    
    // Delete company
    await Company.findByIdAndDelete(id);
    
    return reply.code(204).send();
  } catch (error) {
    console.error('Error deleting company:', error);
    return reply.code(500).send({ error: 'Failed to delete company' });
  }
};

// Application Management
const getAllApplications = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    console.log('Admin API: Fetching all applications from jobs');
    
    // Find all jobs with applicants
    const jobs = await Job.find({ 'applicants.0': { $exists: true } })
      .populate('employer', 'name email')
      .populate({
        path: 'applicants.applicant',
        select: 'name email'
      })
      .populate('applicants.resumeId', 'title');
    
    console.log(`Admin API: Found ${jobs.length} jobs with applicants`);
    
    // Extract the applicants from each job
    const applications = [];
    
    for (const job of jobs) {
      if (job.applicants && Array.isArray(job.applicants) && job.applicants.length > 0) {
        for (const applicant of job.applicants) {
          applications.push({
            _id: `${job._id}_${applicant.applicant._id || applicant.applicant}`,
            job: {
              _id: job._id,
              title: job.title,
              company: job.company,
              employer: job.employer
            },
            user: applicant.applicant,
            status: applicant.status,
            notes: applicant.notes || '',
            resumeId: applicant.resumeId,
            appliedAt: applicant.appliedAt,
            createdAt: applicant.appliedAt,
            updatedAt: applicant.updatedAt
          });
        }
      }
    }
    
    console.log(`Admin API: Extracted ${applications.length} applications from jobs`);
    
    if (applications.length === 0) {
      console.log('Admin API: No applications found');
    } else {
      console.log('Admin API: First application sample:', JSON.stringify(applications[0], null, 2).substring(0, 500) + '...');
    }
    
    return reply.send(applications);
  } catch (error) {
    console.error('Error fetching applications:', error);
    return reply.code(500).send({ error: 'Failed to fetch applications' });
  }
};

const getApplicationById = async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
  try {
    const { id } = request.params;
    
    if (!id || id === 'undefined') {
      return reply.code(400).send({ error: 'Invalid application ID provided' });
    }
    
    // The ID is in format jobId_applicantId
    const [jobId, applicantId] = id.split('_');
    
    if (!jobId || !applicantId) {
      return reply.code(400).send({ error: 'Invalid application ID format' });
    }
    
    // Find job with specific applicant
    const job = await Job.findById(jobId)
      .populate('employer', 'name email')
      .populate({
        path: 'applicants.applicant',
        select: 'name email'
      })
      .populate('applicants.resumeId', 'title');
    
    if (!job) {
      return reply.code(404).send({ error: 'Job not found' });
    }
    
    // Find the specific applicant
    const applicant = job.applicants?.find(app => 
      (app.applicant?._id?.toString() === applicantId) || 
      (app.applicant?.toString() === applicantId)
    );
    
    if (!applicant) {
      return reply.code(404).send({ error: 'Application not found' });
    }
    
    // Format the application
    const application = {
      _id: `${job._id}_${applicant.applicant._id || applicant.applicant}`,
      job: {
        _id: job._id,
        title: job.title,
        company: job.company,
        employer: job.employer
      },
      user: applicant.applicant,
      status: applicant.status,
      notes: applicant.notes || '',
      resumeId: applicant.resumeId,
      appliedAt: applicant.appliedAt,
      createdAt: applicant.appliedAt,
      updatedAt: applicant.updatedAt
    };
    
    return reply.send(application);
  } catch (error) {
    console.error('Error fetching application:', error);
    return reply.code(500).send({ error: 'Failed to fetch application' });
  }
};

const updateApplicationStatus = async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
  try {
    const { id } = request.params;
    const { status } = request.body as any;
    
    console.log(`Admin API: Updating application ${id} with status: ${status}`);
    
    if (!id || id === 'undefined') {
      return reply.code(400).send({ error: 'Invalid application ID provided' });
    }
    
    // The ID is in format jobId_applicantId
    const [jobId, applicantId] = id.split('_');
    
    if (!jobId || !applicantId) {
      return reply.code(400).send({ error: 'Invalid application ID format' });
    }
    
    console.log(`Admin API: Parsed job ID ${jobId} and applicant ID ${applicantId}`);
    
    // Find job
    const job = await Job.findById(jobId);
    
    if (!job) {
      console.log(`Admin API: Job with ID ${jobId} not found`);
      return reply.code(404).send({ error: 'Job not found' });
    }
    
    // Find the specific applicant index
    const applicantIndex = job.applicants?.findIndex(app => 
      (app.applicant?._id?.toString() === applicantId) || 
      (app.applicant?.toString() === applicantId)
    );
    
    if (applicantIndex === undefined || applicantIndex === -1) {
      console.log(`Admin API: Applicant with ID ${applicantId} not found in job`);
      return reply.code(404).send({ error: 'Application not found' });
    }
    
    console.log(`Admin API: Found applicant at index ${applicantIndex}`);
    console.log(`Admin API: Current status: ${job.applicants[applicantIndex].status}`);
    
    // Update the applicant status
    if (status) {
      // Convert status to uppercase
      const normalizedStatus = status.toUpperCase();
      console.log(`Admin API: Normalized status: ${normalizedStatus}`);
      
      // Define valid status values to match employer system
      const validStatusValues = ['PENDING', 'REVIEWING', 'INTERVIEWED', 'REJECTED', 'OFFERED', 'HIRED', 'WITHDRAWN'];
      
      if (!validStatusValues.includes(normalizedStatus)) {
        console.log(`Admin API: Invalid status value: ${normalizedStatus}`);
        console.log(`Admin API: Valid values are: ${validStatusValues.join(', ')}`);
        return reply.code(400).send({ 
          error: 'Invalid status value', 
          validValues: validStatusValues
        });
      }
      
      console.log(`Admin API: Setting status to: ${normalizedStatus}`);
      job.applicants[applicantIndex].status = normalizedStatus;
    }
    
    // Update the updatedAt timestamp
    job.applicants[applicantIndex].updatedAt = new Date();
    
    // Save the job
    console.log(`Admin API: Saving job with updated applicant status`);
    try {
      await job.save();
      console.log(`Admin API: Job saved successfully`);
    } catch (saveError) {
      console.error(`Admin API: Error saving job:`, saveError);
      throw saveError;
    }
    
    // Get the updated job to return
    const updatedJob = await Job.findById(jobId)
      .populate('employer', 'name email')
      .populate({
        path: 'applicants.applicant',
        select: 'name email'
      })
      .populate('applicants.resumeId', 'title');
    
    if (!updatedJob) {
      throw new Error('Failed to retrieve updated job');
    }
    
    // Format the application
    const applicant = updatedJob.applicants[applicantIndex];
    console.log(`Admin API: Updated applicant status is now: ${applicant.status}`);
    
    const application = {
      _id: `${updatedJob._id}_${applicant.applicant._id || applicant.applicant}`,
      job: {
        _id: updatedJob._id,
        title: updatedJob.title,
        company: updatedJob.company,
        employer: updatedJob.employer
      },
      user: applicant.applicant,
      status: applicant.status,
      notes: applicant.notes || '',
      resumeId: applicant.resumeId,
      appliedAt: applicant.appliedAt,
      createdAt: applicant.appliedAt,
      updatedAt: applicant.updatedAt
    };
    
    console.log(`Admin API: Returning application with status: ${application.status}`);
    return reply.send(application);
  } catch (error) {
    console.error('Error updating application status:', error);
    return reply.code(500).send({ error: 'Failed to update application status' });
  }
};

// Add createCompany method
const createCompany = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { name, description, logoUrl, ownerId } = request.body as any;
    
    console.log('Admin API: Creating new company with data:', { name, description, hasLogo: !!logoUrl, ownerId });
    
    // Validate required fields
    if (!name) {
      return reply.code(400).send({ error: 'Company name is required' });
    }
    
    if (!description) {
      return reply.code(400).send({ error: 'Company description is required' });
    }
    
    // Get user ID from request
    const userId = (request as any).user?._id;
    
    // Use ownerId if provided, otherwise use current user
    const companyOwnerId = ownerId || userId;
    
    // Create new company
    const company = new Company({
      name,
      description,
      logoUrl: logoUrl || '',
      createdBy: companyOwnerId,
    });
    
    // Save the company
    await company.save();
    console.log('Admin API: Company created successfully', company._id);
    
    // Create user-company relationship for the owner
    const UserCompany = require('../../../data/models/UserCompany').default;
    const { CompanyRole } = require('../../../data/models/UserCompany');
    
    const userCompany = new UserCompany({
      userId: companyOwnerId,
      companyId: company._id,
      role: CompanyRole.OWNER,
      status: 'ACTIVE'
    });
    
    await userCompany.save();
    console.log('Admin API: User-company relationship created for owner', userCompany._id);
    
    // Fetch the saved company with populated createdBy field
    const savedCompany = await Company.findById(company._id).populate('createdBy', 'name email');
    
    return reply.code(201).send(savedCompany);
  } catch (error) {
    console.error('Error creating company:', error);
    return reply.code(500).send({ error: 'Failed to create company' });
  }
};

export default {
  // Users
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  
  // Jobs
  getAllJobs,
  getJobById,
  updateJob,
  deleteJob,
  
  // Companies
  getAllCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  deleteCompany,
  
  // Applications
  getAllApplications,
  getApplicationById,
  updateApplicationStatus
}; 