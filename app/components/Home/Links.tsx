import Link from 'next/link';
import { FaSpotify, FaTiktok, FaTwitch, FaYoutube } from 'react-icons/fa';

const SocialLinks = () => {
  const socialPlatforms = [
    {
      name: 'YouTube',
      href: '/youtube',
      Icon: FaYoutube,
      color: 'text-red-600',
    },
    {
      name: 'Twitch',
      href: '/twitch',
      Icon: FaTwitch,
      color: 'text-purple-600',
    },
    {
      name: 'Spotify',
      href: '/spotify',
      Icon: FaSpotify,
      color: 'text-green-600',
    },
    { name: 'TikTok', href: '/tiktok', Icon: FaTiktok, color: 'text-black' },
  ];

  return (
    <div className="flex justify-center items-center min-h-screen bg-base-200">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {socialPlatforms.map(({ name, href, Icon, color }) => (
          <Link href={href} key={name}>
            <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow duration-300 cursor-pointer">
              <div className="card-body items-center text-center">
                <Icon className={`text-5xl ${color}`} />
                <h2 className="card-title">{name}</h2>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default SocialLinks;
