import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { kycService } from '@/services/api';
import {
  MapPin,
  ArrowRight,
  Upload,
  Camera,
  CheckCircle,
  AlertCircle,
  Shield,
  FileText,
  User,
  Clock
} from 'lucide-react';
import toast from 'react-hot-toast';

type VerificationStep = 'document' | 'selfie' | 'review' | 'complete';

export function KYCPage() {
  const navigate = useNavigate();
  const { updateProfile } = useAuth();

  const [step, setStep] = useState<VerificationStep>('document');
  const [loading, setLoading] = useState(false);

  // Document upload
  const [documentType, setDocumentType] = useState<'aadhaar' | 'pan' | 'driving_license' | 'passport'>('aadhaar');
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [documentPreview, setDocumentPreview] = useState<string | null>(null);

  // Selfie
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);

  const documentInputRef = useRef<HTMLInputElement>(null);
  const selfieInputRef = useRef<HTMLInputElement>(null);

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      setDocumentFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setDocumentPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelfieUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      setSelfieFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelfiePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitDocument = async () => {
    if (!documentFile) return;
    setStep('selfie');
  };

  const handleSubmitSelfie = async () => {
    if (!selfieFile) return;
    setStep('review');
  };

  const handleSubmitKYC = async () => {
    setLoading(true);

    try {
      // In production, upload files to storage
      await kycService.submitDocument({
        document_type: documentType,
        document_url: documentPreview || 'pending',
        status: 'pending',
      });

      toast.success('KYC submitted successfully!');
      setStep('complete');
    } catch (error) {
      toast.error('Failed to submit KYC');
    } finally {
      setLoading(false);
    }
  };

  const handleSkipKYC = () => {
    navigate('/');
  };

  const handleContinue = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <div className="border-b border-gray-800">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white">Traveloop</span>
          </div>
          <button
            onClick={handleSkipKYC}
            className="text-gray-400 hover:text-white text-sm"
          >
            Skip for now
          </button>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center justify-center gap-4">
          {['document', 'selfie', 'review'].map((s, i) => (
            <React.Fragment key={s}>
              <div className={`flex items-center gap-2 ${
                step === s || (step === 'complete' && s === 'review')
                  ? 'text-emerald-400'
                  : i < ['document', 'selfie', 'review'].indexOf(step)
                    ? 'text-emerald-600'
                    : 'text-gray-600'
              }`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  step === s || (step === 'complete' && s === 'review')
                    ? 'bg-emerald-500 text-white'
                    : i < ['document', 'selfie', 'review'].indexOf(step)
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-700 text-gray-400'
                }`}>
                  {i < ['document', 'selfie', 'review'].indexOf(step) || step === 'complete' ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    i + 1
                  )}
                </div>
                <span className="hidden sm:inline text-sm capitalize">{s}</span>
              </div>
              {i < 2 && (
                <div className={`w-12 h-0.5 ${
                  i < ['document', 'selfie', 'review'].indexOf(step)
                    ? 'bg-emerald-600'
                    : 'bg-gray-700'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-4">
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-8">
          {/* Document Upload Step */}
          {step === 'document' && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-emerald-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Upload Government ID</h2>
                <p className="text-gray-400">This helps us verify your identity for safety</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">Document Type</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'aadhaar', label: 'Aadhaar Card' },
                    { value: 'pan', label: 'PAN Card' },
                    { value: 'driving_license', label: 'Driving License' },
                    { value: 'passport', label: 'Passport' },
                  ].map(doc => (
                    <button
                      key={doc.value}
                      onClick={() => setDocumentType(doc.value as typeof documentType)}
                      className={`px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                        documentType === doc.value
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                          : 'bg-gray-700/50 border-gray-600 text-gray-300 hover:border-gray-500'
                      }`}
                    >
                      {doc.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <input
                  ref={documentInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleDocumentUpload}
                  className="hidden"
                />

                {documentPreview ? (
                  <div className="relative">
                    <img
                      src={documentPreview}
                      alt="Document preview"
                      className="w-full h-48 object-cover rounded-xl"
                    />
                    <button
                      onClick={() => documentInputRef.current?.click()}
                      className="absolute bottom-4 right-4 px-4 py-2 bg-gray-900/80 text-white rounded-lg text-sm hover:bg-gray-900"
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => documentInputRef.current?.click()}
                    className="w-full h-48 border-2 border-dashed border-gray-600 rounded-xl flex flex-col items-center justify-center gap-3 text-gray-400 hover:border-emerald-500 hover:text-emerald-400 transition-all"
                  >
                    <Upload className="w-8 h-8" />
                    <span>Click to upload document</span>
                    <span className="text-xs">PNG, JPG up to 5MB</span>
                  </button>
                )}
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5" />
                  <div className="text-sm text-yellow-200">
                    <p className="font-medium">Important:</p>
                    <ul className="list-disc list-inside mt-1 text-yellow-300/80">
                      <li>Ensure the document is clearly visible</li>
                      <li>All corners should be in frame</li>
                      <li>Document should not be expired</li>
                    </ul>
                  </div>
                </div>
              </div>

              <button
                onClick={handleSubmitDocument}
                disabled={!documentFile}
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                Continue
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Selfie Step */}
          {step === 'selfie' && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                  <Camera className="w-8 h-8 text-emerald-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Take a Selfie</h2>
                <p className="text-gray-400">We'll match this with your document for verification</p>
              </div>

              <input
                ref={selfieInputRef}
                type="file"
                accept="image/*"
                capture="user"
                onChange={handleSelfieUpload}
                className="hidden"
              />

              {selfiePreview ? (
                <div className="relative">
                  <img
                    src={selfiePreview}
                    alt="Selfie preview"
                    className="w-48 h-48 object-cover rounded-full mx-auto"
                  />
                  <button
                    onClick={() => selfieInputRef.current?.click()}
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 px-4 py-2 bg-gray-900/80 text-white rounded-lg text-sm hover:bg-gray-900"
                  >
                    Retake
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => selfieInputRef.current?.click()}
                  className="w-48 h-48 mx-auto border-2 border-dashed border-gray-600 rounded-full flex flex-col items-center justify-center gap-3 text-gray-400 hover:border-emerald-500 hover:text-emerald-400 transition-all"
                >
                  <User className="w-12 h-12" />
                  <span className="text-sm">Tap to take selfie</span>
                </button>
              )}

              <div className="bg-gray-700/30 rounded-xl p-4">
                <p className="text-sm text-gray-300 text-center">
                  Tips for a good selfie:
                </p>
                <ul className="text-sm text-gray-400 mt-2 space-y-1 text-center">
                  <li>• Good lighting, face clearly visible</li>
                  <li>• No sunglasses or masks</li>
                  <li>• Look directly at camera</li>
                </ul>
              </div>

              <button
                onClick={handleSubmitSelfie}
                disabled={!selfieFile}
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                Continue
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Review Step */}
          {step === 'review' && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-emerald-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Review & Submit</h2>
                <p className="text-gray-400">Please review your documents before submitting</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400 mb-2">Document</p>
                  {documentPreview && (
                    <img
                      src={documentPreview}
                      alt="Document"
                      className="w-full h-32 object-cover rounded-xl"
                    />
                  )}
                  <p className="text-xs text-gray-500 mt-1 capitalize">{documentType.replace('_', ' ')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-2">Selfie</p>
                  {selfiePreview && (
                    <img
                      src={selfiePreview}
                      alt="Selfie"
                      className="w-full h-32 object-cover rounded-xl"
                    />
                  )}
                </div>
              </div>

              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-emerald-400 mt-0.5" />
                  <div className="text-sm text-gray-300">
                    <p className="font-medium text-emerald-400">Your data is secure</p>
                    <p className="text-gray-400 mt-1">
                      Documents are encrypted and only used for verification.
                      They are automatically deleted after review.
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleSubmitKYC}
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? 'Submitting...' : 'Submit for Verification'}
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Complete Step */}
          {step === 'complete' && (
            <div className="space-y-6 text-center">
              <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto">
                <Clock className="w-10 h-10 text-emerald-400" />
              </div>

              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Verification Pending</h2>
                <p className="text-gray-400">
                  Your documents have been submitted for verification.
                  This usually takes 24-48 hours.
                </p>
              </div>

              <div className="bg-gray-700/30 rounded-xl p-4">
                <p className="text-sm text-gray-300">
                  You can start exploring trips, but matching with others
                  will be enabled once verification is complete.
                </p>
              </div>

              <button
                onClick={handleContinue}
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-700 transition-all flex items-center justify-center gap-2"
              >
                Continue to App
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
